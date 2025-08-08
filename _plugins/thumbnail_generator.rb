# _plugins/thumbnail_generator.rb
# Place this file in your _plugins directory

require 'mini_magick'
require 'fileutils'

module Jekyll
  class ThumbnailGenerator < Generator
    safe true
    priority :high

    def generate(site)
      @site = site
      @config = site.config['thumbnails'] || {}
      
      # Default configuration
      @thumb_width = @config['width'] || 400
      @thumb_height = @config['height'] || 300
      @thumb_quality = @config['quality'] || 85
      @source_dir = @config['source'] || 'images/gallery'
      @thumb_dir = @config['destination'] || 'images/thumbs'
      @formats = @config['formats'] || ['.jpg', '.jpeg', '.png', '.webp']
      
      generate_thumbnails
    end

    private

    def generate_thumbnails
      source_path = File.join(@site.source, @source_dir)
      thumb_path = File.join(@site.source, @thumb_dir)
      
      puts "🔍 Source path: #{source_path}"
      puts "🔍 Thumb path: #{thumb_path}"
      puts "🔍 Source exists: #{Dir.exist?(source_path)}"
      
      # Create thumbnails directory if it doesn't exist
      FileUtils.mkdir_p(thumb_path) unless Dir.exist?(thumb_path)
      
      # Find all images in gallery directory
      image_files = Dir.glob(File.join(source_path, "**", "*"))
                      .select { |f| @formats.include?(File.extname(f).downcase) }
      
      puts "🔍 Found files: #{Dir.glob(File.join(source_path, "**", "*")).map {|f| File.basename(f)}}"
      puts "🔍 Image files: #{image_files.map {|f| File.basename(f)}}"
      puts "🔍 Supported formats: #{@formats}"
      puts "🖼️  Generating thumbnails for #{image_files.length} images..."
      
      image_files.each do |image_file|
        generate_thumbnail(image_file, source_path, thumb_path)
      end
      
      puts "✅ Thumbnail generation complete!"
    end

    def generate_thumbnail(source_file, source_dir, thumb_dir)
      # Get relative path to maintain directory structure
      relative_path = Pathname.new(source_file).relative_path_from(Pathname.new(source_dir)).to_s
      thumb_file = File.join(thumb_dir, relative_path)
      
      # Convert to WebP filename if WebP is enabled
      if @config['webp']
        thumb_file = thumb_file.sub(/\.(jpg|jpeg|png)$/i, '.webp')
      end
      
      # Debug output
      puts "  📁 Processing: #{File.basename(source_file)}"
      puts "  📍 Source: #{source_file}"
      puts "  📍 Thumb: #{thumb_file}"
      puts "  📍 Exists: #{File.exist?(thumb_file)}"
      
      # Create subdirectories if needed
      FileUtils.mkdir_p(File.dirname(thumb_file))
      
      # Skip if thumbnail is newer than source
      if File.exist?(thumb_file) && File.mtime(thumb_file) >= File.mtime(source_file)
        puts "  ⏭️  Skipping (thumbnail is newer)"
        return
      end
      
      begin
        # Generate thumbnail using MiniMagick
        image = MiniMagick::Image.open(source_file)
        
        # Calculate dimensions maintaining aspect ratio
        original_width = image.width
        original_height = image.height
        aspect_ratio = original_width.to_f / original_height.to_f
        
        if aspect_ratio > (@thumb_width.to_f / @thumb_height.to_f)
          # Image is wider - fit to width
          new_width = @thumb_width
          new_height = (@thumb_width / aspect_ratio).round
        else
          # Image is taller - fit to height
          new_height = @thumb_height
          new_width = (@thumb_height * aspect_ratio).round
        end
        
        # Resize and optimize
        image.resize "#{new_width}x#{new_height}"
        image.quality @thumb_quality
        image.strip # Remove EXIF data
        
        # Convert to WebP for better compression (optional)
        if @config['webp']
          image.format 'webp'
        end

        image.write(thumb_file)
        
        # Get the final relative path for logging (with correct extension)
        final_relative_path = Pathname.new(thumb_file).relative_path_from(Pathname.new(File.join(@site.source, @thumb_dir))).to_s
        puts "  ✓ Generated: #{final_relative_path}"
        
      rescue => e
        puts "  ❌ Error processing #{source_file}: #{e.message}"
      end
    end
  end

  # Liquid filter for getting thumbnail path
  module ThumbnailFilter
    def thumbnail_path(image_path, options = {})
      config = @context.registers[:site].config['thumbnails'] || {}
      thumb_dir = config['destination'] || 'images/thumbs'
      source_dir = config['source'] || 'images/gallery'

      # Remove leading slash if present
      image_path = image_path.sub(%r{^/}, '')

      # Handle relative path calculation more robustly
      if image_path.start_with?(source_dir)
        # Image path includes source directory
        relative_path = image_path.sub(/^#{Regexp.escape(source_dir)}\/?/, '')
      else
        # Image path is just the filename or relative path
        relative_path = image_path
      end

      # Replace extension if webp is enabled
      if config['webp']
        relative_path = relative_path.sub(/\.(jpg|jpeg|png)$/i, '.webp')
      end

      result = File.join("/", thumb_dir, relative_path)
      
      # Debug output
      site = @context.registers[:site]
      full_path = File.join(site.source, result.sub(/^\//, ''))
      puts "🔍 Filter Debug - Input: #{image_path}, Output: #{result}, Exists: #{File.exist?(full_path)}"
      
      result
    end
    
    def has_thumbnail?(image_path)
      thumb_path = thumbnail_path(image_path)
      site = @context.registers[:site]
      full_path = File.join(site.source, thumb_path.sub(/^\//, ''))
      File.exist?(full_path)
    end
  end
end

Liquid::Template.register_filter(Jekyll::ThumbnailFilter)