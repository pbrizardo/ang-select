(function() {

'use strict';

var app = angular.module('myApp',['angSelect']);


app.controller('AppController', [function() {

	var vm = this;
	vm.numbers = [2,3,4,6];
	vm.colors = [{id:1, color:'Red'},{id:2, color:'White'},{id:3, color:'Green'},{id:4, color:'Blue'}];
	vm.colorModel = vm.colors[2];
}]);


})();
