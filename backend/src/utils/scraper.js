import axios from "axios";
import * as cheerio from "cheerio";

import Story from "../models/Story.js";

const convertToMinutes = (
  timeText
) => {

  const value =
    parseInt(timeText);

  if (timeText.includes("minute"))
    return value;

  if (timeText.includes("hour"))
    return value * 60;

  if (timeText.includes("day"))
    return value * 1440;

  return 0;
};

const scrapeStories = async () => {

  try {

    const urls = [

      "https://news.ycombinator.com/",

      "https://news.ycombinator.com/news?p=2",

    ];

    const stories = [];

    for (const pageUrl of urls) {

      const { data } = await axios.get(
        pageUrl
      );

      const $ = cheerio.load(data);

      const rows = $(".athing");

      for (
        let i = 0;
        i < rows.length;
        i++
      ) {

        const row = rows[i];

        if (!row) continue;

        const titleElement = $(row)
          .find(".titleline a");

        const title =
          titleElement.text();

        const url =
          titleElement.attr("href");

        if (!title || !url)
          continue;

        const subtext =
          $(row).next();

        const pointsText = subtext
          .find(".score")
          .text();

        const points =
          parseInt(pointsText) || 0;

        const author = subtext
          .find(".hnuser")
          .text();

        const postedAt = subtext
          .find(".age")
          .text();

        stories.push({
          title,
          url,
          points,
          author,
          postedAt,

          minutesAgo:
            convertToMinutes(
              postedAt
            ),
        });
      }
    }

    await Story.deleteMany();

    await Story.insertMany(stories);

    console.log(
      `${stories.length} stories scraped successfully`
    );

  } catch (error) {

    console.log(error);

  }
};

export default scrapeStories;