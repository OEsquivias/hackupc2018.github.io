// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css';

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import INeedAHeroArtifact from '../../build/contracts/INeedAHero.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const INeedAHero = contract(INeedAHeroArtifact)

let account;
var HeroContract;

var stop;
var snooze;

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    INeedAHero.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      account = accs[0];
      INeedAHero.deployed().then(function (instance) {
        HeroContract = instance;
      });
    })
  },

  needHelp: function () {
    var span = document.getElementById('span');
    navigator.geolocation.getCurrentPosition(function(pos){
        var lat = pos["coords"].latitude;
        var lon = pos["coords"].longitude;
        var accuracy = pos["coords"].accuracy;
        HeroContract.needHelp(account, 414927410, 21474290, accuracy, {from:account, gas:1000000});
        // HeroContract.needHelp(account, lat*1e7, lon*1e7, accuracy, {from:account, gas:1000000});
        span.innerHTML = "Request was sent";
        App.timer(lat, lon);
      },
      function(err){
        console.log(err);
      },
      {enableHighAccuracy: true}
    );
  },

  beHero: function () {
    var checkbox = document.getElementById("beAHero");
    var linkList = document.getElementById('linkList');
    HeroContract.Alert().watch(function(error, result) {
      var lat = parseInt(result["args"]["_lat"])*1./1e7;
      var lon = parseInt(result["args"]["_lon"])*1./1e7;
      var id = result["args"]["_id"];

      navigator.geolocation.getCurrentPosition(function(pos){
        var dist = App.getRadius(lat, lon, pos["coords"].latitude, pos["coords"].longitude);

        // if (dist < 1000 && checkbox.checked) { COSAS 
        if (checkbox.checked) {
          var a = document.createElement('a');
          var linkText = document.createTextNode("Somebody needs you\n");
          a.appendChild(linkText);
          a.title = "my title text";
          a.href = "https://www.google.com/maps/?q="+lat+","+lon;
          document.body.appendChild(a);
        }
      });
    });

  },

  getRadius: function(lat_help, lon_help, lat_hero, lon_hero){
     var Earth_Radius = 6369.35 * 1e3;
     var phi_helper = lat_help * Math.PI / 180.0;
     var phi_hero = lat_hero * Math.PI / 180.0;
     var lmb_helper = lon_help * Math.PI / 180.0;
     var lmb_hero = lon_hero * Math.PI / 180.0;
     var sin_dphi = Math.sin( (phi_helper - phi_hero)/2 );
     var a = sin_dphi*sin_dphi+Math.cos(phi_helper)*Math.cos(phi_hero)*Math.sin((lmb_helper-lmb_hero)/2)*Math.sin((lmb_helper-lmb_hero)/2);
     var c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
     return c*Earth_Radius;
   },

   timer: function(lat, lon) {
     stop = false;
     snooze = false;
     var minut = 1000*60;
     var late = new Date().getTime() + minut/6;
     var countDownDate = new Date(late).getTime();

     // Update the count down every 1 second
     var x = setInterval(function() {

         // Get todays date and time
         var now = new Date().getTime();

         // Find the distance between now and the count down date
         var distance = countDownDate - now;

         // Time calculations for days, hours, minutes and seconds
         var days = Math.floor(distance / (1000 * 60 * 60 * 24));
         var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
         var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
         var seconds = Math.floor((distance % (1000 * 60)) / 1000);

         // Output the result in an element with id="demo"
         document.getElementById("demo").innerHTML =minutes + "m " + seconds + "s ";

         if (stop) {
           clearInterval(x);
         }

         if (snooze) {
           clearInterval(x);
           App.timer();
         }

         // If the count down is over, write some text
         if (distance < 0) {
             clearInterval(x);
             var xhttp = new XMLHttpRequest();
             xhttp.open("GET", "https://api.telegram.org/bot648982787:AAFwJrWI09o7QUjPGe9ZJaE_KB6cKNG2LJ0/sendMessage?chat_id=709412242&text=https://www.google.com/maps/?q="+lat+","+lon, true);
             xhttp.send();
             var xhttp = new XMLHttpRequest();
             xhttp.open("GET", "https://api.telegram.org/bot648982787:AAFwJrWI09o7QUjPGe9ZJaE_KB6cKNG2LJ0/sendMessage?chat_id=558519076&text=https://www.google.com/maps/?q="+lat+","+lon, true);
             xhttp.send();
             var xhttp = new XMLHttpRequest();
             xhttp.open("GET", "https://api.telegram.org/bot648982787:AAFwJrWI09o7QUjPGe9ZJaE_KB6cKNG2LJ0/sendMessage?chat_id=245461326&text=https://www.google.com/maps/?q="+lat+","+lon, true);
             xhttp.send();
             document.getElementById("demo").innerHTML = "A message was sent to the police";
         }
     }, 1000);
   },

   stopTimer: function() {
     stop = true;
   },

   snoozeTimer: function() {
     snooze = true;
   }

}





window.App = App

window.addEventListener('load', function () {
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
  App.start()
})