"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $submitForm.hide();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $submitForm.hide();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $submitForm.hide();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// hide page and show submit form
function navSubmitStory() {
  hidePageComponents();
  $submitForm.show();
  console.debug("navSubmitStory");
}
// click handler for navSubmitStories
$submit.on("click", navSubmitStory);

// hide page and show favorite stories
function navFavoriteStories() {
  hidePageComponents();
  putFavoriteStoriesOnPage();
  $submitForm.hide();
}
// click handler for navFavoriteStories
$navFavorite.on("click", navFavoriteStories);
