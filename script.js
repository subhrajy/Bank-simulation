'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2022-01-12T10:17:24.185Z',
    '2022-01-13T14:11:59.604Z',
    '2022-01-14T17:01:17.194Z',
    '2022-01-15T23:36:17.929Z',
    '2022-01-16T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Subhrajyoti Behera',
  movements: [500, 4500, -50, -340, -1234, -343, 23442, -30],
  interestRate: 3.5,
  pin: 3333,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2022-01-05T16:33:06.386Z',
    '2022-01-10T14:43:26.374Z',
    '2022-01-11T18:49:59.371Z',
    '2022-01-12T12:01:20.894Z',
  ],
  currency: 'INR',
  locale: 'en-IN',
};

const accounts = [account1, account2, account3];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();

    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);

    // in each callback call print the remaining time to UI
    labelTimer.textContent = `${min}:${seconds}`;

    // when time is 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      document.querySelector(`body`).style.pointerEvents = `none`;
      labelWelcome.textContent = `Log in to get started`;
    }

    // decrease one second
    time -= 1;
  };

  // setting the time to 5 minutes
  let time = 100;

  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // display current date and time

    const now = new Date();
    const options = {
      hour: `numeric`,
      minute: `numeric`,
      day: `numeric`,
      month: `numeric`,
      // month: `long`,
      // month: `2-digit`,
      year: `numeric`,
      // year: `2-digit`,
      // weekday: `long`,
    };
    // getting locale from user's browser
    // const locale = navigator.language;
    console.log(currentAccount.locale);

    // labelDate.textContent = new Intl.DateTimeFormat(`ar-SY`).format(now);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minute = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // start logout timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // reset the timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/////////////////////////////////////////////////
// Numbers

/*
// 64 base 2 format
console.log(23 === 23.0);

// base 10: 0 - 9. 1 / 10 = 0.1, 3 / 10 = 3.33333333333333...
// binary 2: 0 and 1.
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// conversion
console.log(Number(`23`));
console.log(+`23`);
console.log(1 + `23`);
console.log(`23` + 1);

// parsing
// parseInt() accepts a second argument called radix i.e the base of the numeral system
console.log(Number.parseInt(`30px`, 10)); // string needs to start with a number
console.log(Number.parseInt(`e23`, 10));
console.log(Number.parseFloat(`2.5 rem  `));

// we can do this, but using Number.parseInt is encouraged in modern JS, as Number provides a NameSpace
console.log(parseInt(`  2.5rem`));

// check if NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN(`20`));
console.log(Number.isNaN(+`20X`)); //NaN
console.log(Number.isNaN(23 / 0));

// the best way of checking if a value is a number
console.log(Number.isFinite(23));
console.log(Number.isFinite(`23x`));
console.log(Number.isFinite(+`23x`));
console.log(Number.isFinite(+`23`));
console.log(Number.isFinite(Infinity));

// check if value is an integer
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));
*/

/////////////////////////////////////////////////
// Math and rounding

/*
// root
console.log(Math.sqrt(16));
console.log(16 ** (1 / 2));
console.log(8 ** (1 / 3)); // cubic root

// max value
console.log(Math.max(2, 35, 4, 56, 6, 7, 5, 67));
console.log(Math.max(2, 35, 4, 56, 6, 7, 5, `67`)); // does coerhion
console.log(Math.max(2, 35, 4, 56, 6, 7, 5, `67px`)); // does not parse

// min value
console.log(Math.min(2, 35, 4, 56, 6, 7, 5, 67));

// constants
console.log(Math.PI);
console.log(Math.PI * Number.parseFloat(`10px`) ** 2);

// random
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// Math.random() -> 0...1 -> 0...(max - min) -> 0 + min...(max - min + min) -> min...max
console.log(randomInt(10, 20));

// rounding integers
console.log(Math.trunc(23.232323));
console.log(Math.round(23.93));

console.log(Math.ceil(23.23));
console.log(Math.ceil(23.93));

console.log(Math.floor(23.23));
console.log(Math.floor(23.93));

console.log(Math.floor(23.93));
console.log(Math.floor(`23.93`));
// floor and trunc both cut the tails incase of positive numbers
console.log(Math.trunc(-23.232323)); //-23
console.log(Math.floor(-23.232323)); //-24

// rounding decimals
console.log((2.7).toFixed(0)); // toFixed returns a STRING
console.log((2.7).toFixed(3));
console.log((2.2345).toFixed(2));
console.log(+(2.2345).toFixed(2)); // to number
*/

/////////////////////////////////////////////////
// reminder operator

/*
console.log(5 % 2);
console.log(8 % 3);
console.log(8 / 3);

console.log(6 % 2);

const isEven = num => num % 2 === 0;
console.log(isEven(2));
console.log(isEven(3));
console.log(isEven(23));
console.log(isEven(8));

labelBalance.addEventListener(`click`, function () {
  [...document.querySelectorAll(`.movements__row`)].forEach(function (cur, i) {
    if (i % 2 === 0) cur.style.backgroundColor = `orangeRed`;
    if (i % 3 === 0) cur.style.backgroundColor = `blue`;
  });
});
*/

/////////////////////////////////////////////////
// numeric separator

/*
// 287,460,000,000
const diameterSolarSystem1 = 287460000000;
const diameterSolarSystem2 = 287_460_000_000; // numeric separator

console.log(diameterSolarSystem2);

const priceInCents = 345_99;
console.log(priceInCents);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

//  const PI = 3._1415; // ERROR
//  const PI = 3_.1415; // ERROR
//  const PI = _3.1415; // ERROR
//  const PI = 3.1415_; // ERROR
//  const PI = 3.14__15; // ERROR
const PI = 3.1415;
console.log(PI);

console.log(Number(`230000`));
console.log(Number(`230_000`)); // NaN
console.log(Number.parseInt(`230_000`)); // NaN
*/

/////////////////////////////////////////////////
// BIGINT

/*
// numbers are represented as 64 bits internally, only 53 of them are used to store digits, rest are for storing decimal points and sign

console.log(2 ** 53 - 1); // bigest number JS can represent by default
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 0);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);
console.log(2 ** 53 + 5);

// BIGINT
console.log(23232323982937827488238772837827387283n);
console.log(BigInt(23232323982937827488238772837827387283));

// operations
console.log(10000n + 10000n);
console.log(234567543245643454345643454345643543453n * 2345321345n);
// console.log(Math.sqrt(16n)); // error

const huge = 23456754324565434565432456n;
const num = 23;
// console.log(num * huge); // error
console.log(huge * BigInt(num));

// exception 1
console.log(20n > 12); //true
console.log(20n === 20); // false
console.log(20n == 20); // true
console.log(typeof 20n);

// exception 2
console.log(huge + ` is really big`);

// divisions
console.log(10n / 3n); // 3n
console.log(10 / 3); // 3.33333333333...
console.log(11n / 3n); // 3n
console.log(12n / 3n); // 4n
*/

/////////////////////////////////////////////////
// dates and times

/*
// dates
// create a date (4 ways, new Date())
const now = new Date();
console.log(now);

console.log(new Date(`jan 17 2022 15:37:52`));
console.log(new Date(`December 24, 2015`));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5)); // month is zero based (10 - November)
console.log(new Date(2039, 10, 31)); // auto-correct
console.log(new Date(2039, 10, 33)); // auto-correct

console.log(new Date(0)); // beginning of unix time
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // 3 days after unix time (3 * 24 * 60 * 60 * 1000 == 259200000) this is called time stamp of day number 3


// working with date
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getYear());
console.log(future.getMonth()); // zero based
console.log(future.getDay()); // day number of the week (0 - Sunday)
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime()); // time stamp

console.log(new Date(2142237180000)); // reverse time stamp

console.log(Date.now());

// set methods
future.setFullYear(2040);
console.log(future);
*/

/////////////////////////////////////////////////
// date operations

/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(Number(future));
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const days1 = calcDaysPassed(
  new Date(2037, 3, 4),
  new Date(2037, 3, 14, 10, 8 /* use Math.floor() / Math.round() )
);
console.log(days1);
*/

/////////////////////////////////////////////////
// internationalization

/*
// numbers
const num = 124354321.23;
const options = {
  // style: `unit`,
  // style: `percent`,
  style: `currency`,
  // unit: `mile-per-hour`,
  // unit: `celsius`,
  currency: `EUR`, // currency is not defined by the locale
  // useGrouping: false,
};

console.log(`US:       `, new Intl.NumberFormat(`en-US`, options).format(num));
console.log(`IN:       `, new Intl.NumberFormat(`en-IN`, options).format(num));
console.log(`PT:       `, new Intl.NumberFormat(`pt-PT`, options).format(num));
console.log(`Germany:  `, new Intl.NumberFormat(`de-DE`, options).format(num));
console.log(`Syria:    `, new Intl.NumberFormat(`ar-SY`, options).format(num));
console.log(
  `Browser:  `,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/

/////////////////////////////////////////////////
// timers (setTimeOut(): runs just once after a defined time, setIntervalTImer(): keeps running forever untill we stop it)

/*
// setTimeOut(): Execute some code at some point in the future (asynchronous JS)
const ingrediants = [`olives`, `spinach`];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}.`),
  3000,
  ...ingrediants
);
console.log(`Waiting...`);

if (ingrediants.includes(`spinach`)) {
  clearTimeout(pizzaTimer);
}

// setInterval(): execute a function over and over again
setInterval(function () {
  const now = new Date();
  const options = {
    hour: `numeric`,
    minute: `numeric`,
    second: `numeric`,
  };
  // const hour = now.getHours();
  // const minute = now.getMinutes();
  // const second = now.getSeconds();

  const dateTimeNow = Intl.DateTimeFormat(`en-IN`, options).format(now);

  // console.log(`${hour}:${minute}:${second}`);
  console.log(dateTimeNow);
}, 1000);
*/
