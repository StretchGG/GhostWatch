---
layout: partial
permalink: /fragment/home
---

<div class="info-stack">
  <section class="about">
    <h2>About Project Ghost</h2>
    <p>Project Ghost is an upcoming MMORPG by <a href="https://fantasticpixelcastle.com/" target="_blank">Fantastic Pixel Castle</a>, a studio founded by Greg Street. The team has many industry veterans with backgrounds in World of Warcraft, Riot Games and Guild Wars, to name a few.</p>
    <br>
    <p>Fantastic Pixel Castle is taking a open development approach to their game. They have a podcast, <a href="https://www.youtube.com/watch?v=Srvis5NigZ0&list=PLBs3DklCxIXyoIqNcm5IJ1_x5qUA_3a_x&index=1" target="_blank">Word on the Street</a>,  where the team shares insights to not only Project Ghost but also broader topics in game development. From design philosophy to production challenges. They also have a shorter series called Ghost Stories, where they answer focused questions from the community. These formats help foster transparency and give fans a glimpse into the creative process as the game takes shape and allows for viewers to give feedback early on.</p>
    <br>
    <p>The goal of this site is just to be used as a  reference hub for everything currently known about Project Ghost.</p>
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

<script>
document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.faq-tab');
  const groups = document.querySelectorAll('.faq-category-group');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedCategory = tab.dataset.category;

      groups.forEach(group => {
        const groupCategory = group.dataset.category;
        if (selectedCategory === 'All' || groupCategory === selectedCategory) {
          group.style.display = '';
        } else {
          group.style.display = 'none';
        }
      });
    });
  });

  // FAQ expand/collapse
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const inner = item.querySelector('.faq-answer-inner');
    let isAnimating = false;

    question.addEventListener('click', () => {
      if (isAnimating) return;
      const isOpen = item.classList.contains('active');
      isAnimating = true;

      if (isOpen) {
        answer.style.height = inner.offsetHeight + 'px';
        answer.offsetHeight;
        answer.style.height = '0px';

        const handleCollapse = (e) => {
          if (e.target === answer && e.propertyName === 'height') {
            item.classList.remove('active');
            answer.style.height = '';
            answer.removeEventListener('transitionend', handleCollapse);
            isAnimating = false;
          }
        };
        answer.addEventListener('transitionend', handleCollapse);
      } else {
        item.classList.add('active');
        const targetHeight = inner.offsetHeight;
        answer.style.height = targetHeight + 'px';

        const handleExpand = (e) => {
          if (e.target === answer && e.propertyName === 'height') {
            answer.style.height = 'auto';
            answer.removeEventListener('transitionend', handleExpand);
            isAnimating = false;
          }
        };
        answer.addEventListener('transitionend', handleExpand);
      }
    });
  });
});
</script>
