document.addEventListener("DOMContentLoaded", () => {
   function GameSession() {
      this.stars = 0;
      this.maxStars = 9000;
      this.coins = 1000000;
      this.win = 0.0;
      this.bet = 50000;
   }

   GameSession.prototype.setSession = function () {
      if (sessionStorage.getItem("stars") !== null) {
         this.stars = parseInt(sessionStorage.getItem("stars"), 10);
      }
      if (sessionStorage.getItem("maxStars") !== null) {
         this.maxStars = parseInt(sessionStorage.getItem("maxStars"), 10);
      }
      if (sessionStorage.getItem("coins") !== null) {
         this.coins = parseInt(sessionStorage.getItem("coins"), 10);
      }
      if (sessionStorage.getItem("win") !== null) {
         this.win = parseFloat(sessionStorage.getItem("win"));
      }
      if (sessionStorage.getItem("bet") !== null) {
         this.bet = parseInt(sessionStorage.getItem("bet"), 10);
      }

      sessionStorage.setItem("stars", String(this.stars));
      sessionStorage.setItem("maxStars", String(this.maxStars));
      sessionStorage.setItem("coins", String(this.coins));
      sessionStorage.setItem("win", String(this.win));
      sessionStorage.setItem("bet", String(this.bet));
   };

   GameSession.prototype.setStars = function (value) {
      this.stars = value;
      sessionStorage.setItem("stars", String(value));
      return value;
   };

   GameSession.prototype.setCoins = function (value) {
      this.coins = value;
      sessionStorage.setItem("coins", String(value));
      return value;
   };

   GameSession.prototype.setWin = function (value) {
      this.win = value;
      sessionStorage.setItem("win", String(value));
      return value;
   };

   GameSession.prototype.setBet = function (value) {
      this.bet = value;
      sessionStorage.setItem("bet", String(value));
      return value;
   };

   GameSession.prototype.incBet = function () {
      if (this.bet < this.coins) {
         this.setBet(this.bet + 1000);
      }
      return this.bet;
   };

   GameSession.prototype.decBet = function () {
      if (this.bet > 0) {
         this.setBet(this.bet - 1000);
      }
      return this.bet;
   };

   var autoWin = true;
   var intervals = [];
   var timeout = 0;
   var times = [];

   const columns = document.querySelectorAll(".roller__column");

   const buttons = document.querySelectorAll("button");
   const buttonDecrement = document.querySelector(".decrement");
   const buttonIncrement = document.querySelector(".increment");
   const buttonSpin = document.querySelector(".spin");
   const buttonAuto = document.querySelector(".auto");

   const coins = document.querySelector(".indicator__score_coins");
   const stars = document.querySelector(".indicator__score_star");
   const win = document.querySelector(".win");
   const bet = document.querySelector(".bet");

   const shifterElement = document.querySelector(".shifter");

   columns.forEach((column) => {
      const images = column.querySelectorAll(".roller__img");
      const imageArray = Array.from(images);
      shuffle(imageArray, 0.2);

      imageArray.forEach((img) => {
         column.appendChild(img);
      });
   });

   function uiLock(locked, excludeAuto = false) {
      buttons.forEach((button) => {
         if (excludeAuto) {
            if (!button.classList.contains("auto")) {
               button.disabled = locked;
            }
         } else {
            button.disabled = locked;
         }
      });
   }

   function uiRefresh() {
      if (coins && stars) {
         coins.textContent = game.coins.toString();
         coins.setAttribute("data-value", game.coins.toString());
         stars.textContent = game.stars.toString() + "/" + game.maxStars.toString();
         stars.setAttribute(
            "data-value",
            game.stars.toString() + "/" + game.maxStars.toString()
         );
         if (bet && win) {
            bet.textContent = game.bet.toString();
            bet.setAttribute("data-value", game.bet.toString());
            win.textContent = game.win.toString();
            win.setAttribute("data-value", game.win.toString());
         }
      }
   }

   function shuffle(array, coefficient) {
      const length = array.length;
      for (let i = length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         const randomFactor = Math.random() * coefficient;
         if (Math.random() > 0.5 - randomFactor) {
            [array[i], array[j]] = [array[j], array[i]];
         } else {
            [array[j], array[i]] = [array[i], array[j]];
         }
      }
   }

   function imagesRollAddClass() {
      const images = document.querySelectorAll(".roller__img");
      images.forEach((image) => {
         image.classList.add("roller__img_spin");
      });
   }

   function imagesRollRemoveClass() {
      const images = document.querySelectorAll(".roller__img");
      images.forEach((image) => {
         image.classList.remove("roller__img_spin");
      });
   }

   function moveImagesUp(roller) {
      var firstImage = roller.querySelector(".roller__img:first-child");
      roller.appendChild(firstImage.cloneNode(true));
      firstImage.remove();
   }

   function getRandomNumber(min, max, similarityCoefficient) {
      similarityCoefficient = Math.max(0, Math.min(1, similarityCoefficient));

      const randomValue = Math.random();

      const adjustedRandomValue = Math.pow(randomValue, 1 + similarityCoefficient);

      if (adjustedRandomValue >= 0.5) {
         const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
         return [randomNumber, randomNumber, randomNumber];
      } else {
         const number1 = Math.floor(Math.random() * (max - min + 1)) + min;
         const number2 = Math.floor(Math.random() * (max - min + 1)) + min;
         const number3 = Math.floor(Math.random() * (max - min + 1)) + min;
         return [number1, number2, number3];
      }
   }

   function findDuplicateDataIDs() {
      var result = [];
      const columns = document.querySelectorAll(".roller__column");
      columns.forEach((column) => {
         const images = column.querySelectorAll(".roller__img");
         const middleIndex = Math.floor(images.length / 2);
         if (images[middleIndex] && images[middleIndex + 1]) {
            const dataId = images[middleIndex - 1].getAttribute("data-id");
            result.push(dataId);
         }
      });
      return result;
   }

   function checkArrayEquality(arr) {
      for (let i = 1; i < arr.length; i++) {
         if (arr[i] !== arr[0]) {
            return false;
         }
      }
      return true;
   }

   function fullTimes() {
      for (let index = 0; index < 4; index++) {
         if (index !== 3) {
            times.push(getRandomNumber(3, 5, 0.99));
         } else {
            times.push(Math.floor(Math.random() * (4000 - 6000 + 1)) + 4000);
         }
      }
   }

   function setIntervals() {
      columns.forEach((column, key) => {
         intervals.push(
            setInterval(function () {
               moveImagesUp(column);
            }, times[key] * 10)
         );
      });
   }

   function removeIntervals() {
      setTimeout(() => {
         intervals.forEach((interval) => {
            clearInterval(interval);
         });
         checkBet();
         checkWin();
         imagesRollRemoveClass();
         uiRefresh();
         uiLock(false, false);
      }, times[3]);
   }

   function loopUntilWin() {
      if (autoWin) return;
      if (game.coins === 0) {
         stopAutoLoop();
         return;
      }
      if (game.bet > game.coins) {
         stopAutoLoop();
         return;
      }

      game.setCoins(game.coins - game.bet);
      uiRefresh();

      fullTimes();
      imagesRollAddClass();

      columns.forEach((column, key) => {
         intervals.push(
            setInterval(function () {
               moveImagesUp(column);
            }, times[key] * 10)
         );
      });

      timeout = setTimeout(() => {
         intervals.forEach((interval) => {
            clearInterval(interval);
         });
         checkBet();
         imagesRollRemoveClass();
         uiRefresh();
         if (checkWin()) {
            setTimeout(() => {
               loopUntilWin();
            }, 1200);
         } else {
            stopAutoLoop();
            uiLock(false);
         }
      }, times[3]);
   }

   function stopAutoLoop() {
      const buttonAuto = document.querySelector(".auto");
      buttonAuto.style.filter = null;
      intervals.forEach((interval) => {
         clearInterval(interval);
      });
      clearTimeout(timeout);
      checkBet();
      imagesRollRemoveClass();
      uiRefresh();
      uiLock(false);
   }

   function checkWin() {
      const hideElementsWin = document.querySelectorAll(".indicator__score_hide");
      const result = findDuplicateDataIDs();
      if (checkArrayEquality(result)) {
         if (hideElementsWin) {
            hideElementsWin.forEach((element) => {
               if (element.classList.contains("indicator__score_hide")) {
                  element.classList.remove("indicator__score_hide");
               }
            });
         }
         game.setWin(game.win + game.bet * 5);
         return false;
      }
      return true;
   }

   function checkBet() {
      if (game.bet > game.coins) {
         game.setBet(game.coins);
      }
   }

   var game = new GameSession();
   game.setSession();

   uiRefresh();

   if (buttonSpin && buttonAuto) {
      buttonSpin.addEventListener("click", () => {
         if (game.bet > 0) {
            uiRefresh();
            if (game.coins > 0 && game.bet <= game.coins) {
               uiLock(true);
               game.setCoins(game.coins - game.bet);
               if (game.stars < game.maxStars) {
                  game.setStars(game.stars + 100);
               }
               uiRefresh();
               spin();
            }
         }
      });

      buttonAuto.addEventListener("click", () => {
         if (game.bet > 0) {
            uiRefresh();
            if (game.coins > 0 && game.bet < game.coins) {
               const buttons = document.querySelectorAll("button");
               const buttonAuto = document.querySelector(".auto");
               buttonAuto.style.filter = "brightness(1.2)";
               buttons.forEach((button) => {
                  if (!button.classList.contains("auto")) {
                     button.disabled = true;
                  }
               });
               auto();
            }
         }
      });
   }

   if (shifterElement) {
      const indicatorScoreElement = shifterElement.querySelector(".indicator__score");

      if (indicatorScoreElement) {
         function updateIndicatorScore(value) {
            indicatorScoreElement.textContent = value.toString();
            indicatorScoreElement.setAttribute("data-value", value.toString());
         }
         updateIndicatorScore(game.bet);
         buttonDecrement.addEventListener("click", function () {
            updateIndicatorScore(game.decBet());
         });
         buttonIncrement.addEventListener("click", function () {
            updateIndicatorScore(game.incBet());
         });
      }
   }

   function spin() {
      if (columns.length === 3) {
         fullTimes();
         imagesRollAddClass();
         setIntervals();
         removeIntervals();
      }
   }

   function auto() {
      if (columns.length === 3 && autoWin) {
         autoWin = false;
         loopUntilWin();
      } else {
         autoWin = true;
         stopAutoLoop();
      }
   }

   const gameButton = document.querySelector(".royal-coin");
   if (gameButton) {
      gameButton.addEventListener("click", function () {
         var currentUrl = window.location.href;
         var newUrl = currentUrl.replace("menu.html", "game.html");
         window.location.href = newUrl;
      });
   }

   const backButton = document.querySelector(".back");
   if (backButton) {
      backButton.addEventListener("click", function () {
         var currentUrl = window.location.href;
         var newUrl = currentUrl.replace("game.html", "menu.html");
         window.location.replace(newUrl);
      });
   }
});
