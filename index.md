---
layout: default
title: GhostWatch
---

<div class="info-stack">
  <section class="about">
    <h2>About Project Ghost</h2>
    <p>Project Ghost is an upcoming MMORPG by Fantastic Pixel Castle, a studio founded by Greg Street. The team has many industry veterans with backgrounds in World of Warcraft, Riot Games and Guild Wars, to name a few.</p>
    <br>
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
