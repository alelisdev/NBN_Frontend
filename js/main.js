// utils
// get siblings
const getSiblings = n => [...n.parentElement.children].filter(c=>c.nodeType == 1 && c!=n);

// show header list mobile
const body = document.body;
const burgerMenu = document.querySelector('.burger-menu');
const closeHeaderList = document.querySelector('.close-header-list-mobile');

if(burgerMenu)
	burgerMenu.onclick = () => {
		body.classList.add('--show-header-list-mobile');
	}

if(closeHeaderList)
	closeHeaderList.onclick = () => {
		body.classList.remove('--show-header-list-mobile');
	}

// choices
const choicesLists = document.querySelectorAll('.choices-list');
choicesLists.forEach( list => {
	const items = list.querySelectorAll('.choice__item');
	items.forEach( item => {

		// click interaction
		item.addEventListener('click', function() {
			if(!this.classList.contains('--is-active')) {
				// remove --is-active className from siblings
				getSiblings(this).forEach( sibling => {
					sibling.classList.remove('--is-active');
				});
				// add --is-active className to clicked item
				this.classList.add('--is-active');
			}
		});
	});
});

// filters
const filterItems = document.querySelectorAll('.filters .filter__item');
const filtersData = document.querySelector('.filters-data')
const filteredItems = document.querySelectorAll('.filters-data .choice__item');

filterItems.forEach( item => {
	item.addEventListener('click', function() {
		this.classList.add('--is-active');
		getSiblings(this).forEach( item => {
			item.classList.remove('--is-active');
		});

		const cat = this.getAttribute('data-category');

		if(cat != 'show-all') {
			let selectedItems = [];
			filteredItems.forEach((item, i) => {
				const cats = item.dataset.category.split(',');
				cats.map(c => {
					if(cat == c) selectedItems.push(item)
				});
			})
			filteredItems.forEach( item => item.classList.remove('--is-shown'));
			selectedItems.forEach( item => item.classList.add('--is-shown'));

			// Show byo
			$('#choose-modem .choices-list .choice__item').eq(0).addClass('--is-shown');
		} else {
			filteredItems.forEach( item => item.classList.add('--is-shown'));
		}
	});
});

// calendar
if(typeof dhtmlXCalendarObject == 'function'){
	let myCalendar = new dhtmlXCalendarObject("calendar-wrapper");
	myCalendar.setDateFormat('%l');
	myCalendar.show();
	myCalendar.hideTime();

	myCalendar.attachEvent('onClick', function(value){
		// deselect 
		if(window.location.href.match('/nbn-dev/') != null){
			$('.inaactd1, .inaactd2, .inaactd2-1').removeClass('--is-active');
		}

		var value = new Date(myCalendar.getDate()).toDateString();
		$('.inaactd3').addClass('--is-active');
		if(value != '')
			app.setInstallDay(3, 'day', value)
	});

	window.myCalendar = myCalendar;
}
