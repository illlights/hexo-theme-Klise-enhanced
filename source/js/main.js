(() => {

  // Theme switch
  const body = document.body;
  const lamp = document.getElementById("mode");

  let elem = document.querySelectorAll('figure.highlight')
  elem.forEach(function(item){
    let langName = item.getAttribute('class').split(' ')[1]
    if (langName === 'plain' || langName === undefined) langName = 'Code'
    item.setAttribute('data-lang',langName);
  })

  // 根据系统偏好自动选择主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
      // 如果有保存的主题偏好，使用保存的
      if (savedTheme === "dark") {
        body.setAttribute("data-theme", "dark");
      } else {
        body.removeAttribute("data-theme");
      }
    } else {
      // 如果没有保存的主题偏好，检查系统偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // 系统偏好暗色主题
        localStorage.setItem("theme", "dark");
        body.setAttribute("data-theme", "dark");
      } else {
        // 系统偏好亮色主题或不支持检测
        localStorage.setItem("theme", "dark");
        body.removeAttribute("data-theme");
      }
    }
  };

  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // 只有在用户没有手动设置主题时才自动切换
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        if (e.matches) {
          localStorage.setItem("theme", "dark");
          body.setAttribute("data-theme", "dark");
        } else {
          localStorage.setItem("theme", "light");
          body.removeAttribute("data-theme");
        }
      }
    });
  }

  const toggleTheme = (state) => {
    if (state === "dark") {
      localStorage.setItem("theme", "light");
      body.removeAttribute("data-theme");
    } else if (state === "light") {
      localStorage.setItem("theme", "dark");
      body.setAttribute("data-theme", "dark");
    } else {
      initTheme();
    }
  };

  // 初始化主题
  initTheme();

  lamp.addEventListener("click", () =>
    toggleTheme(localStorage.getItem("theme"))
  );

  // Blur the content when the menu is open
  const cbox = document.getElementById("menu-trigger");

  cbox.addEventListener("change", function () {
    const area = document.querySelector(".wrapper");
    this.checked
      ? area.classList.add("blurry")
      : area.classList.remove("blurry");
  });

  // 获取元素
const toggleButton = document.getElementById('toggleButton');
const overlay = document.getElementById('overlay');
const closeButton = document.getElementById('closeButton');

// 切换显示和隐藏
toggleButton.addEventListener('click', function() {
  overlay.style.display = overlay.style.display === 'none' || overlay.style.display === '' ? 'flex' : 'none';
  toggleButton.style.display = 'none';  // 隐藏返回顶部按钮
});

// 点击关闭按钮
closeButton.addEventListener('click', function() {
  overlay.style.display = 'none';
  toggleButton.style.display = 'flex';
  
});

// 获取按钮
let toTopBtn = document.getElementById("toTopBtn");

// 当用户向下滚动20px时，显示按钮
window.onscroll = function () {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    toTopBtn.style.display = "flex";
  } else {
    toTopBtn.style.display = "none";
  }
};

toTopBtn.addEventListener('click',function(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
})




})();

