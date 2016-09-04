var CONFIG = {
	BASE_URL: 'http://orca.workwoo.com'
}
var currentURL = window.location.href;
if(currentURL.indexOf('localhost') > 0) {
    CONFIG.BASE_URL = 'http://localhost:1337';
} else if(currentURL.indexOf('orca-stage') > 0) {
    CONFIG.BASE_URL = 'http://orca-stage.workwoo.com';
}