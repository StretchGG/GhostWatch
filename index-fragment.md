---
layout: partial
permalink: /fragment/home
---

<div class="info-stack">
  <section class="about">
    <h2>About Project Ghost</h2>
    <p>Project Ghost is an upcoming MMORPG by <a href="https://fantasticpixelcastle.com/" target="_blank">Fantastic Pixel Castle</a>, a studio founded by Greg Street. The team has many industry veterans with backgrounds in World of Warcraft, Riot Games and Guild Wars, to name a few.</p>
    <br>
    <p>Fantastic Pixel Castle is taking an open development approach to their game. They have a podcast, <a href="https://www.youtube.com/watch?v=Srvis5NigZ0&list=PLBs3DklCxIXyoIqNcm5IJ1_x5qUA_3a_x&index=1" target="_blank">Word on the Street</a>,  where the team shares insights to not only Project Ghost but also broader topics in game development. They also have a shorter series called Ghost Stories, where they answer focused questions from the community. This gives fans a glimpse into the creative process as the game takes shape and allows for viewers to give feedback early on.</p>
    <br>
    <h2>About This Site</h2>
    <p>The goal of this site is just to be used as a reference hub for everything currently known about Project Ghost.</p>
    <br>
    <p>If you would like to contact me about this site:</p>
    <p>Discord: StretchGG</p>
    <p>Bluesky: <a href="https://bsky.app/profile/stretch.bsky.social" target="_blank">@stretch.bsky.social</a></p>
    <p>Twitter/X: <a href="https://x.com/Stretchz" target="_blank">@Stretchz</a></p>
    <p>Twitch: <a href="https://www.twitch.tv/stretchz" target="_blank">@Stretchz</a></p>
  </section>

  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    <h4>As this game is still early in development, information is likely to change. I'll try to keep this up to date.</h4>

    {% assign sorted_faqs = site.faq | sort: 'position' %}
    {% assign categories = sorted_faqs | map: "title" %}

    <div class="faq-tabs">
      <button class="faq-tab active" data-category="All">All</button>
      {% for cat in categories %}
        <button class="faq-tab" data-category="{{ cat | escape }}">{{ cat }}</button>
      {% endfor %}
    </div>

    <div class="faq-content">
      {% for faq_file in sorted_faqs %}
        {% assign category = faq_file.title %}
        <div class="faq-category-group" data-category="{{ category }}">
          <h3 class="faq-category-title">{{ category }}</h3>
          {% for item in faq_file.faqs %}
            <div class="faq-item" data-category="{{ category }}">
              <button class="faq-question">
                {{ item.question }}
                <span class="toggle-icon">+</span>
              </button>
              <div class="faq-answer">
                <div class="faq-answer-inner">
                  <p>{{ item.answer }}</p>
                </div>
              </div>
            </div>
          {% endfor %}
        </div>
      {% endfor %}
    </div>
  </section>
</div>
<script src="/js/faq.js"></script> 