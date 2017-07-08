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
        $scope.loginFailed = true;
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


    $scope.found = {
      'showAlert': false,
      'alertMessage': '',
      'showMessage': false,
      'message': ''
    }
    $scope.foundData = {
      'type': '',
      'number': '',
      'name': '',
      'phone': '',
      'email': '',
      'message': '',

      'clear': function () {
        this.type = '';
        this.number = '';
        this.name = '';
        this.phone = '';
        this.email = '';
        this.message = '';
      }
    }
    $scope.documentPublicated = {
      'show': false,
      'type': '',
      'number': '',
      'name': '',
      'phone': '',
      'message': '',
      'date': '',
      'fromMap': function (map) {
        this.type = map.type;
        this.number = map.number ;
        this.name = map.name;
        this.phone = map.phone ;
        this.email = map.email ;
        this.message = map.message;
        this.date=getToday();
      },
      'fromDocument': function (map) {
        this.type = map.type;
        this.number = map.number ;
        this.name = map.loster.name;
        this.phone = map.loster.phone ;
        this.email = map.loster.email ;
        this.message = map.message;
        this.date = map.publication_date.substring(0,10)
      }
    }
    $scope.emptyFoundValues = function () {
      $scope.type = ''
      $scope.number = ''
      $scope.name = ''
      $scope.phone = ''
      $scope.email = ''
      $scope.message = ''
    }
    $scope.publishFoundDocument = function () {
      $scope.documentPublicated.show = false;
      $scope.found.showMessage = false;
      $scope.found.showAlert = false;
      var value = getEmptyMapValue($scope.foundData);
      var a = 1;
      if (!emptyStr(value)) {
        $scope.found.showAlert = true;
        $scope.found.alertMessage = 'Campo ' + value + ' no puede ser vacío.';
      } else {
        api.post('publishFoundDocument', $scope.foundData, function (result) {
          if (result.data.exists) {
            if (result.data.found) {
              $scope.found.showMessage = true;
              $scope.found.message = 'Alguien ya publico este documento como perdido, lo tienes tu? Reporta el problema en la sección contacto.';
            } else {
              $scope.found.showMessage = true;
              $scope.documentPublicated.fromDocument(result.data.data);
              $scope.foundData.clear();
              $scope.documentPublicated.show = true;
              $scope.found.message = 'Felicitaciones! Alguien habia denunciado como perdido el documento, contáctate para devolverlo, gracias!';
              $scope.emptyFoundValues();
            }

          } else {
            $scope.found.showMessage = true;
            $scope.documentPublicated.fromMap($scope.foundData);
            $scope.foundData.clear();
            $scope.documentPublicated.show = true;
            $scope.found.message = 'Gracias por tu publicación! Te enviaremos un mail y le daremos tus datos al propietario cuando denuncie su documento como perdido.';
          }
        })
      }

    }

    $scope.publishLossedDocument = function () {
      $scope.lossedPublication.show = false;
      $scope.documentFindedValue = false;
      $scope.searchMissingField = false;
      $scope.searchSucces = false;
      if (emptyStr($scope.searchType) || emptyStr($scope.searchNumber)) {
        $scope.searchMissingField = true;
        $scope.searchMissingFieldValue = 'Campo ' + (emptyStr($scope.searchType) ? 'tipo de documento' : 'número')
          + ' no puede ser vacío.'
      } else {
        api.post('api/publishLossedDocument', { 'number': $scope.searchNumber, 'type': $scope.searchType }, function (result) {
          $scope.searchSucces = true;
          if (result.data.exists) {
            if (result.data.found) {
              $scope.searchType = '';
              $scope.searchNumber = '';
              $scope.searchSuccesValue = 'Felicitaciones! Alguien ha encontrado tu documento, datos:'
              $scope.documentFinded = result.data.doc;
              $scope.documentFinded.publication_date = $scope.documentFinded.publication_date.substring(0, 10);
              $scope.documentFindedValue = true;
            } else {
              if (result.data.publicatedByMe) {
                $scope.searchSuccesValue = "Ya publicaste este documento anteriormente, te avisaremos enseguida cuando aparezca."
              } else {
                $scope.searchSuccesValue = 'Alguien ya denunció este documento como perdido, te pertenece? Envíanos un mensaje en la sección contaco con tus datos y el reclamo.'
              }
            }
          } else {
            $scope.searchSuccesValue = 'Gracias por publicar! Te avisaremos enseguida cuando lo aparezca.'
            $scope.lossedPublication.show = true;
            $scope.lossedPublication.type = $scope.searchType;
            $scope.lossedPublication.number = $scope.searchNumber;
            $scope.lossedPublication.date = getToday();
            $scope.searchType = '';
            $scope.searchNumber = '';
          }
        })
      }
    }
    $scope.lossedPublication = {
      'show': false,
      'type': '',
      'number': '',
      'date':''
    }

    $scope.searching = false;
    $scope.searchType;
    $scope.searchNumber;
    $scope.searchSucces = false;
    $scope.searchSuccesValue;
    $scope.searchMissingField = false;
    $scope.searchMissingFieldValue;
    $scope.searchDocument = function () {
      $scope.searchSucces = false;
      $scope.lossedPublication.show = false;
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
            $scope.searchSuccesValue = 'No encontramos tu documento. Publícalo como perdido y te informaremos cuando alguien lo encuentre. '
            if (!$scope.loginValue) {
              $scope.searchSuccesValue = 'No encontramos tu documento, regístrate y publícalo como perdido. Te informaremos cuando alquien lo encuentre.';
            }
          }
        })
      }
    }
    $scope.documentFinded;
    $scope.documentFindedValue;
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
          $scope.registering = false;
          if (result.ok) {
            if (result.exists) {
              $scope.missingField = true;
              $scope.missingFieldValue = 'Email ya fue utilizado.'
            } else {
              $scope.email = $scope.user.email
              $scope.password = $scope.user.password
              smoothScroll(document.getElementById('main'))
            }

          } else {
            $scope.missingField = true;
            $scope.missingFieldValue = result.message
          }
        })
      }
    }
    $scope.showRegisterButton = function () { return $scope.searchSucces && !$scope.loginValue && !$scope.searching };



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

function getFieldName(field) {
  switch (field) {
    case 'type':
      return 'tipo de documento'
    case 'number':
      return 'identificador'
    case 'name':
      return 'nombre'
    case 'phone':
      return 'celular'
    case 'email':
      return 'email'
    default:
      return undefined;
  }
}

function getEmptyMapValue(map) {
  var key = (emptyStr(map.type) ? 'type' : (emptyStr(map.number) ? 'number' : (emptyStr(map.name) ? 'name' : (emptyStr(map.phone) ? 'phone' : (emptyStr(map.email) ? 'email' : '')))))
  var ret = getFieldName(key);
  return ret;
}
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
function getToday(){
  var currentDate = new Date()
  var day = currentDate.getDay();
  var month = currentDate.getMonth();
  var year = currentDate.getFullYear()
  return  (day + "/" + month + "/" + year )
}
