import './homepage.css';

document.addEventListener('DOMContentLoaded', () => {
    const menuBurger = document.querySelector('.menu-burger');
    menuBurger.addEventListener('click', () => {
        document.body.classList.toggle('menu-active');
    });
});
