'use strict';

function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Google',
      url: 'https://www.google.com',
      description: 'Search Engine',
      rating: 3,
    },
    {
      id: 2,
      title: 'Gmail',
      url: 'https://www.gmail.com',
      description: 'google mail',
      rating: 5
    },
    {
      id: 3,
      title: 'Youtube',
      url: 'https://www.youtube.com',
      description: null,
      rating: 1,
    }
  ];
}

module.exports = {
  makeBookmarksArray,
};