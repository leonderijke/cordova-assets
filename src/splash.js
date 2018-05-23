const path = require("path");
const gm = require("gm");
const makeDir = require("make-dir");
const ios = require("./ios");
const android = require("./android");

/**
 * Determines the right arguments for the resize method:
 * - width takes precedence if the splash is wider than the source
 * - otherwise, height takes precedence
 * - all while maintaining the aspect ratio of the source image
 *
 * @param {object} size
 * @param {object} splash
 */
const getResizeDimensions = (size, splash) => {
  const imageRatio = size.width / size.height;
  const splashRatio = splash.width / splash.height;

  return imageRatio < splashRatio ? [splash.width] : [null, splash.height];
};

/**
 * Generates a splash image
 *
 * @param {string} img
 * @param {object} size
 * @param {object} splash
 */
async function generateSplashImage(img, size, splash) {
  const { ext } = path.parse(img);

  return makeDir(splash.dir).then(
    () =>
      new Promise((resolve, reject) => {
        const target = path.join(splash.dir, splash.name);

        gm(img)
          .resize(...getResizeDimensions(size, splash))
          .gravity("Center")
          .crop(splash.width, splash.height)
          .write(`${target}${ext}`, err => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
      })
  );
}

/**
 * Generates all splash images for all platforms for a given image.
 *
 * @param {string} img
 * @param {object} size
 */
async function generateSplashImages(img, size) {
  return Promise.all(
    [...ios.splash, ...android.splash].map(splash =>
      generateSplashImage(img, size, splash)
    )
  );
}

/**
 * Returns the image dimensions
 *
 * @param {string} img
 */
async function getImageSize(img) {
  return new Promise((resolve, reject) => {
    gm(img).size((err, size) => {
      if (err) {
        return reject(err);
      }

      resolve(size);
    });
  });
}

/**
 * Kicks off splash image generation
 *
 * @param {string} img
 */
async function splash(img) {
  const size = await getImageSize(img);

  return generateSplashImages(img, size).then(() => {
    console.log("All done!");
  });
}

module.exports = splash;
