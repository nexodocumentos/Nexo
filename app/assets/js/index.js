'use strict';
// Declare app level module which depends on views, and components
var myApp = angular.module('Nexo', [
  'LocalStorageModule'])
//myApp.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
//  $locationProvider.hashPrefix('!');
//$routeProvider.otherwise({redirectTo: '/view1'});
//}])


myApp.controller('indexCtrl', ['$scope'
  , '$http'
  // instead of this
  // ,'LocalStorageModule',
  // use this
  , 'localStorageService',
  function ($scope, $http, localStorageService) {
    //localStorage.clear();
    function loadLocalStorage() {
      $scope.loginValue = emptyStr(localStorage.getItem('loginValue')) ? false : localStorage.getItem('loginValue');
      $scope.name = emptyStr(localStorage.getItem('name')) ? '' : localStorage.getItem('name');
      $scope.email = emptyStr(localStorage.getItem('email')) ? '' : localStorage.getItem('email');
      $scope.token = emptyStr(localStorage.getItem('token')) ? '' : localStorage.getItem('token');
    }
    function saveLocalStorage() {
      localStorage.setItem('loginValue', $scope.loginValue);
      localStorage.setItem('name', $scope.name);
      localStorage.setItem('email', $scope.email);
      localStorage.setItem('token', $scope.token);
    }
    function clearLocalStorage() {
      localStorage.clear();
    }
    const api = {
      'post': function (url, body, cback) {
        $http.post("http://localhost:8085/" + url, body, { headers: { 'Authorization': $scope.token } })
          .then(function (response) {
            if (response.status = 200 && response.data.success) {
              cback(response.data);
            } else {
              if (response.data.error == 'TokenExpiredError') {
                $scope.logout();
                alert('Su sesión ha expirado, inicia devuelta.')
              } else {
                alert('Error al conectar con servidor.' + response.message);
              }
            }
          });
      },
      'get': function (url, params, cback) {
        $http.get("http://localhost:8085/" + url + (params ? '?' + params : ''), { headers: { 'Authorization': $scope.token } })
          .then(function (response) {
            if (response.status = 200 && response.data.success) {
              cback(response.data);
            } else {
              if (response.data.error == 'TokenExpiredError') {
                logout();
                alert('Su sesión ha expirado, inicia devuelta.')
              } else {
                alert('Error al conectar con servidor.' + response.message);
              }
            }
          });
      }
    }

    loadLocalStorage();
    $scope.loginValue;
    $scope.loginFailed = false;
    $scope.name;
    $scope.email;
    $scope.password;


    $scope.type;
    $scope.number;
    $scope.document = {
      type: '',
      number: '',
      finder: {
        'name': '',
        'phone': ''
      },
      loster: {
        'name': '',
        'phone': ''
      }
    }
    $scope.logout = function () {
      $scope.user = '';
      $scope.email = '';
      $scope.password = '';
      $scope.token = '';
      clearLocalStorage();
      $scope.loginValue = false;
      location.reload();
    }
    $scope.login = function () {
      $scope.loginFailed = false;
      if (emptyStr($scope.email) || emptyStr($scope.password)) {
        alert('Email o password no pueden ser vacíos.');
      } else {
        api.post('logIn', { 'email': $scope.email, 'password': $scope.password }, function (result) {
          if (result.ok) {
            $scope.name = result.data.name;
            $scope.token = result.token;
            $scope.loginValue = true;
            $scope.searchSuccesValue = '';
            $scope.searchSucces = false;
            saveLocalStorage();
          } else {
            $scope.loginFailed = true;
          }
        })
      }

    }

    $scope.logOut = function () {
      $scope.loginValue = false;
      $scope.token = '';
    }

    $scope.findDocument = function () {
      api.get('findDocument', 'type=' + $scope.type + '&number=' + $scope.number, function (result) {
        if (result) {

        }
      })
    }

    $scope.publishFoundDocument = function () {
      api.post('publishFoundDocument', document, function (result) {
        if (result) {

        }
      })
    }

    $scope.publishLossedDocument = function () {
      if (emptyStr($scope.searchType) || emptyStr($scope.searchNumber)) {
        $scope.searchMissingField = true;
        $scope.searchMissingFieldValue = 'Campo ' + (emptyStr($scope.searchType) ? 'tipo de documento' : 'número')
          + ' no puede ser vacío.'
      } else {
        api.post('api/publishLossedDocument', { 'number': $scope.searchNumber, 'type': $scope.searchType }, function (result) {
          $scope.searchSucces = true;
          if (result.data.exists) {
            if (result.data.found) {
              $scope.searchSuccesValue = 'Datos de quien lo encontro:'
              $scope.documendFinded = result.doc;
              $scope.documendFindedValue = true;
            } else {
              if (result.data.publicatedByMe) {
                $scope.searchSuccesValue = "Ya publicaste este documento anteriormente, te enviaremos un mail cuando alguien lo encuentre!"
              } else {
                $scope.searchSuccesValue = 'Alguien ya denunció este documento como perdido, te pertenece? Envíanos un mensaje en la sección contaco con tus datos y el reclamo.'
              }
            }
          } else {
            $scope.searchSuccesValue = 'Gracias por publicar ! Te avisaremos por mial cuando alguien lo encuentre.'
          }
        })
      }
    }
    $scope.searching = false;
    $scope.searchType;
    $scope.searchNumber;
    $scope.searchSucces = false;
    $scope.searchSuccesValue;
    $scope.searchMissingField = false;
    $scope.searchMissingFieldValue;
    $scope.searchDocument = function () {
      $scope.searchMissingField = false;
      if (emptyStr($scope.searchType) || emptyStr($scope.searchNumber)) {
        $scope.searchMissingField = true;
        $scope.searchMissingFieldValue = 'Campo ' + (emptyStr($scope.searchType) ? 'tipo de documento' : 'número')
          + ' no puede ser vacío.'
      } else {
        $scope.searching = true;
        api.get('findDocument', 'type=' + $scope.searchType + '&number=' + $scope.searchNumber, function (result) {
          $scope.searching = false;
          $scope.searchSucces = true;
          if (result.data.exists) {
            if (result.data.found) {
              $scope.searchSuccesValue = 'Felicitaciones! Alguien ha encontrado tu documento, publícalo como perdido para ver sus datos.'
              if (!$scope.loginValue) {
                $scope.searchSuccesValue = 'Felicitaciones! Alguien ha encontrado tu documento, regístrate para obtener sus datos.'
              }
            } else {//Ya se denuncio como perdido
              $scope.searchSuccesValue = 'Alguien ya denunció este documento como perdido, te pertenece? Envíanos un mensaje en la sección contaco con tus datos y el reclamo.'
            }
            //$scope.document = result.data.data;
          } else {
            $scope.searchSuccesValue = 'No encontramos tu documento. Publícalo como perdido y te informaremos cuando alquien lo encuentre. '
            if (!$scope.loginValue) {
              $scope.searchSuccesValue = 'No encontramos tu documento, regístrate y publícalo como perdido. Te informaremos cuando alquien lo encuentre.';
            }
          }
        })
      }
    }
    $scope.documendFinded;
    $scope.documendFindedValue;
    $scope.user = {
      'name': '',
      'ci': '',
      'email': '',
      'phone': '',
      'country': '',
      'password': '',
      'password1': ''
    };
    $scope.registering = false;
    $scope.missingField = false;
    $scope.missingFieldValue = '';
    $scope.register = function () {
      $scope.missingField = false;
      if (emptyStr($scope.user.name) || emptyStr($scope.user.ci) || emptyStr($scope.user.phone) || emptyStr($scope.user.password) || emptyStr($scope.user.password1)) {
        $scope.missingField = true;
        $scope.missingFieldValue = 'Campo ' + (emptyStr($scope.user.name) ? 'nombre' : (emptyStr($scope.user.ci) ? 'cedula' : (emptyStr($scope.user.phone) ? 'celular' : (emptyStr($scope.user.password) ? 'password' : (emptyStr($scope.user.email) ? 'email' : (emptyStr($scope.user.password1) ? 'repeat password' : ''))))))
          + ' no puede ser vacío.'
      } else {
        $scope.registering = true;
        api.post('registerUser', $scope.user, function (result) {
          if (result.success) {
            $scope.registering = false;
            $scope.email = $scope.user.email
            $scope.password = $scope.user.password
            smoothScroll(document.getElementById('main'))
          }
        })
      }
    }
    $scope.types = [
      { 'name': 'Cedula de identidad', 'value': 'ci' },
      { 'name': 'Tarjeta', 'value': 'terjeta' },
      { 'name': 'Boletera', 'value': 'boletera' },
      { 'name': 'Pasaporte', 'value': 'pasaporte' },
      { 'name': 'Ciudadanía', 'value': 'ciudadania' },
      { 'name': 'Otro', 'value': 'otro' }
    ]


    $scope.publishType = { 'name': '', 'value': '' };
    $scope.publish = function () {

    }

  }]);


function emptyStr(x) {
  return (x == undefined || x == 'undefined' || x == null || x == '');
}
window.smoothScroll = function (target) {
  var scrollContainer = target;
  do { //find scroll container
    scrollContainer = scrollContainer.parentNode;
    if (!scrollContainer) return;
    scrollContainer.scrollTop += 1;
  } while (scrollContainer.scrollTop == 0);

  var targetY = 0;
  do { //find the top of target relatively to the container
    if (target == scrollContainer) break;
    targetY += target.offsetTop;
  } while (target = target.offsetParent);

  scroll = function (c, a, b, i) {
    i++; if (i > 30) return;
    c.scrollTop = a + (b - a) / 30 * i;
    setTimeout(function () { scroll(c, a, b, i); }, 20);
  }
  // start scrolling
  scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
}

