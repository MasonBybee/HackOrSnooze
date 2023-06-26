"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <label for='favoritecheck'>Favorite</label>
        <input type='checkbox'id="favoritecheck">
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    if (currentUser) {
      if (story.username === currentUser.username) {
        const removeButton = $("<button>");
        removeButton.text("Delete");
        removeButton.on("click", function () {
          const id = $(this).parent().attr("id");
          removeStory(id);
        });
        $story.append(removeButton);
      }
    }
    $allStoriesList.append($story);
    if (currentUser) {
      const favorites = currentUser.favorites;
      for (let favoriteStory of favorites) {
        if (favoriteStory.storyId === story.storyId) {
          $(`#${story.storyId}`)
            .find('input[type="checkbox"]')
            .prop("checked", true);
        }
      }
    }
  }
  $allStoriesList.show();
}
/////////////////////////////////////////////////////////
async function submitNewStory() {
  try {
    console.debug("SubmitnewStory");
    // Make newStory opj to pass to the add story method
    const newStory = {
      title: $("#submit-title").val(),
      author: $("#submit-author").val(),
      url: $("#submit-url").val(),
    };
    const storyList = await StoryList.getStories();
    await storyList.addStory(currentUser, newStory).then(function () {
      putStoriesOnPage();
      $submitForm.hide();
    });
  } catch (error) {
    console.error("An error occurred while submitting the story:", error);
  }
}

$submitForm.on("submit", function () {
  submitNewStory();
});

async function removeStory(id) {
  try {
    await axios
      // Delete request to the api to delete to story of id
      .delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${id}`, {
        data: { token: currentUser.loginToken },
      })
      .then(putStoriesOnPage);
    // remove the li with an id of id
    $body.find(`#${id}`).remove();
  } catch (error) {
    console.error("An error occurred while deleting the story:", error);
  }
}
// favorite checkbox event handler
$body.on("change", 'input[type="checkbox"]', function () {
  // if no logged on user set checkbox back to false and then do nothing
  if (!currentUser) {
    alert("Please log in to add this to your favorites");
    $(this).prop("checked", false);
    return;
  }
  // get the story id
  const id = $(this).parent().attr("id");

  // if checked add story to favorites if unchecked remove from favorites
  if ($(this).is(":checked")) {
    currentUser.addFavorite(id);
  } else {
    currentUser.removeFavorite(id);
  }
});

async function putFavoriteStoriesOnPage() {
  // empty stories and get favorite storys
  $allStoriesList.empty();
  let favoriteStories = currentUser.favorites;

  // for each story id get data from the api
  for (let story of favoriteStories) {
    try {
      const response = await axios
        .get(`https://hack-or-snooze-v3.herokuapp.com/stories/${story.storyId}`)
        .then(function (response) {
          const responseData = response.data.story;

          // make new instance of story out of it
          const newFavoriteStory = new Story({
            storyId: responseData.storyId,
            title: responseData.title,
            author: responseData.author,
            url: responseData.url,
            username: responseData.username,
            createdAt: responseData.createdAt,
          });
          // generate html for story
          const $story = generateStoryMarkup(newFavoriteStory);
          // check for current user and that the current user owns this story
          if (currentUser && responseData.username === currentUser.username) {
            // add a delete button for story
            const removeButton = $("<button>");
            removeButton.text("Delete");
            // add event handler for button
            removeButton.on("click", function () {
              const id = $(this).parent().attr("id");
              removeStory(id);
            });
            $story.append(removeButton);
          }

          $allStoriesList.append($story);

          $(`#${story.storyId}`)
            .find('input[type="checkbox"]')
            .prop("checked", true);
        });
    } catch (error) {
      console.error("Error retrieving favorite stories:", error);
    }
  }

  $allStoriesList.show();
}
