// utils
// get siblings
const getSiblings = n => [...n.parentElement.children].filter(c=>c.nodeType == 1 && c!=n);

// show header list mobile
const body = document.body;
const burgerMenu = document.querySelector('.burger-menu');
const closeHeaderList = document.querySelector('.close-header-list-mobile');

burgerMenu.onclick = () => {
	body.classList.add('--show-header-list-mobile');
}

closeHeaderList.onclick = () => {
	body.classList.remove('--show-header-list-mobile');
};