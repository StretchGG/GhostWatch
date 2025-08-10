---
layout: default
title: GhostWatch
permalink: /gallery
---

{%- assign all_tags = site.photo_gallery | map: "tags" | join: "," | split: "," | uniq -%}
{%- assign all_tags = all_tags | reject: "" | sort -%}

{%- if all_tags.size > 0 -%}
  <div class="faq-tabs gallery-tabs">
    <button class="faq-tab active" data-tag="All">All</button>
    {% for tag in all_tags %}
      <button class="faq-tab" data-tag="{{ tag | strip }}">{{ tag | strip }}</button>
    {% endfor %}
  </div>
{%- endif -%}

<div class="gallery-grid loading" id="gallery">
  {%- assign gallery_items = site.photo_gallery | group_by: "date" -%}
  {%- assign sorted_groups = gallery_items | sort: "name" | reverse -%}
  {%- for date_group in sorted_groups -%}
    {%- assign items_by_name = date_group.items | sort: "name" | reverse -%}
    {%- for image in items_by_name -%}
      {%- assign aspect_ratio = image.width | times: 1.0 | divided_by: image.height -%}
      {%- assign thumb_path = image.image_path | thumbnail_path -%}

      {%- assign source_icon = "" -%}
      {%- assign source_name = "" -%}
      {%- if image.source contains "bsky.app" -%}
        {%- assign source_icon = "/images/site/bluesky-icon.png" -%}
        {%- assign source_name = "Bluesky" -%}
      {%- elsif image.source contains "x.com" or image.source contains "twitter.com" -%}
        {%- assign source_icon = "/images/site/x-icon.png" -%}
        {%- assign source_name = "X (Twitter)" -%}
      {%- elsif image.source contains "youtube.com" or image.source contains "youtu.be" -%}
        {%- assign source_icon = "/images/site/youtube-icon.png" -%}
        {%- assign source_name = "YouTube" -%}
      {%- elsif image.source contains "fantasticpixelcastle.com" or image.source contains "fantasticpixelcastle.com" -%}
        {%- assign source_icon = "/images/site/fantasticpixelcastle-icon.png" -%}
        {%- assign source_name = "Fantastic Pixel Castle" -%}
      {%- else -%}
        {%- assign source_name = image.source -%}
      {%- endif -%}

      {%- assign item_classes = "pswp-gallery__item" -%}
      {%- if aspect_ratio > 1.2 -%}
        {%- assign item_classes = item_classes | append: " wide" -%}
      {%- elsif aspect_ratio < 0.75 -%}
        {%- assign item_classes = item_classes | append: " tall" -%}
      {%- endif -%}

      <div class="{{ item_classes }}" data-tags="{{ image.tags | join: ',' | escape }}">
        <a href="{{ image.image_path }}"
           data-pswp-width="{{ image.width }}"
           data-pswp-height="{{ image.height }}"
           data-full-src="{{ image.image_path }}"
           target="_blank">
          <div class="image-container">
            <div class="image-placeholder"></div>
            <img class="gallery-image"
                 data-src="{{ thumb_path }}"
                 data-full="{{ image.image_path }}"
                 alt="{{ image.title }}"
                 loading="lazy"
                 decoding="async" />
          </div>
        </a>
        <div class="pswp-caption-content">
          <u><b>{{ image.title }}</b><br></u>
          <p>{{ image.description }}</p>
          {%- if source_icon != "" -%}
            <p> Source: </p>
            <a href="{{ image.source }}" target="_blank" class="source-link">
              <img src="{{ source_icon }}" alt="{{ source_name }}" class="source-icon" title="{{ source_name }}">
            </a>
          {%- else -%}
            <a href="{{ image.source }}" target="_blank">{{ image.source }}</a>
          {%- endif -%}
        </div>
      </div>
    {%- endfor -%}
  {%- endfor -%}
</div>

<div id="loading-indicator" class="loading-indicator">
  <div class="spinner"></div>
  <p>Loading gallery...</p>
</div>

<script type="module" src="/js/gallery.js"></script> 