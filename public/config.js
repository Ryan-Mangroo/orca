var CONFIG = {
	BASE_URL: 'http://orca.workwoo.com',
	UNAUTH_URL: 'http://www.workwoo.com/#/login'
}
var currentURL = window.location.href;
if(currentURL.indexOf('localhost') > 0) {
    CONFIG.BASE_URL = 'http://localhost:1337';
    CONFIG.UNAUTH_URL = 'http://localhost:1337/login.html';
} else if(currentURL.indexOf('orca-stage') > 0) {
    CONFIG.BASE_URL = 'http://orca-stage.workwoo.com';
    CONFIG.UNAUTH_URL = 'http://orca-stage.workwoo.com/login.html';
}