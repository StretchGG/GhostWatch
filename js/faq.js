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