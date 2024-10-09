const mangayomiSources = [{
  "name": "Hanime",
  "lang": "zh",
  "baseUrl": "https://hanime1.me",
  "apiUrl": "",
  "iconUrl": "https://vdownload.hembed.com/image/icon/tab_logo.png?secure=EJYLwnrDlidVi_wFp3DaGw==,4867726124",
  "typeSource": "single",
  "isManga": false,
  "isNsfw": true,
  "version": "0.0.2",
  "dateFormat": "",
  "dateFormatLocale": "",
  "pkgPath": "anime/src/zh/hanime.js",
  "hasCloudflare": true
}];

class DefaultExtension extends MProvider {
  dateStringToTimestamp(dateString) {
    var parts = dateString.split('-');
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1;
    var day = parseInt(parts[2]);

    var date = new Date(year, month, day);
    var timestamp = date.getTime();

    return timestamp;
  }

  async getItems(url, type) {
    const res = await new Client({'useDartHttpClient': true}).get(this.source.baseUrl + url);
    const doc = new Document(res.body);
    const items = [];
    if (type == 0) {
      const elements = doc.select("div.home-rows-videos-wrapper a");
      for (const element of elements) {
        const title = element.selectFirst("div.home-rows-videos-title").text;
        const cover = element.selectFirst("div img").attr("src");
        const url = element.attr("href");
        items.push({
          name: title,
          imageUrl: cover,
          link: url + "$" + cover
        });
      }
    } else {
      const elements = doc.selectFirst("div.content-padding-new").selectFirst("div.row").select("div.col-xs-6");
      for (const element of elements) {
        const url = element.selectFirst("a").attr("href");
        const title = element.selectFirst("div.card-mobile-title").text;
        const cover = element.select("img")[1].attr("src");
        items.push({
          name: title,
          imageUrl: cover,
          link: url + "$" + cover
        });
      }
    }
    return {
      list: items,
      hasNextPage: true
    };
  }

  async getPopular(page) {
    return await this.getItems(`/search?sort=%E8%A7%80%E7%9C%8B%E6%AC%A1%E6%95%B8&page=${page}`, 1);
  }

  async getLatestUpdates(page) {
    return await this.getItems(`/search?sort=%E6%9C%80%E6%96%B0%E4%B8%8A%E5%B8%82&page=${page}`, 1);
  }

  async search(query, page, filters) {
    var url_str = "";
    var type = 1;
    for (const filter of filters) {
      if (filter["type"] == "genre") {
        url_str = url_str + filter["values"][filter["state"]]["value"];
        if ((filter["state"] == 1) || (filter["state"] == 2)) {
          type = 0;
        }
      } else if (filter["type"] == "tags") {
        for (const tag of filter["state"]) {
          if (tag["state"]) {
            url_str = url_str + tag["value"];
          }
        }
      } else if (filter["type"] == "sort") {
        url_str = url_str + filter["values"][filter["state"]]["value"];
      }
    }
    return await this.getItems(`/search?query=${query}${url_str}&page=${page}`, type);
  }

  async getDetail(url) {
    var cover;
    [url, cover] = url.split("$");
    const res = await new Client({'useDartHttpClient': true}).get(url);
    const doc = new Document(res.body);
    const title = doc.selectFirst("div#video-playlist-wrapper h4").text;
    const desc = doc.selectFirst("div.video-details-wrapper div.video-caption-text").text;
    const adddate = this.dateStringToTimestamp(doc.selectFirst("div.video-details-wrapper").text.split("  ")[1]);
    const author = doc.selectFirst("a#video-artist-name").text.replaceAll("\n", "").trim(" ");
    const tags = doc.select("div.single-video-tag a ").map(e => e.text).slice(0, -2);
    const eps_ = doc.selectFirst("div#video-playlist-wrapper").select("div#playlist-scroll div.related-watch-wrap");
    const eps = [];
    for (const ep of eps_) {
      const name = ep.selectFirst("div.card-mobile-title").text;
      const url = ep.selectFirst("a.overlay").attr("href");
      eps.push({
        name: name,
        url: url,
        dateUpload: adddate.toString()
      });
    }
    return {
      name: title,
      imageUrl: cover,
      author: author,
      genre: tags,
      description: desc,
      episodes: eps,
      link: url
    };
  }

  async getVideoList(url) {
    const res = await new Client({'useDartHttpClient': true}).get(url);
    const doc = new Document(res.body);
    const sources = doc.select("source");
    if (sources.length==0) {
        const url =   res.body.match(/"contentUrl": "(.+?)"/)[1];
        return [{
            url: url,
            originalUrl: url,
            quality: "Origin"            
            }];            
    }  
    const results = [];
    for (const source of sources) {
      const url = source.attr("src");
      const quality = source.attr("size") + "P";
      results.push({
        url: url,
        originalUrl: url,
        quality: quality
      });
    }
    return results;
  }

  getFilterList() {
    return [{
        type: "genre",
        name: "Genre",
        type_name: "SelectFilter",
        values: [{
            type_name: "SelectOption",
            value: "&genre=%E5%85%A8%E9%83%A8",
            name: "All"
          },
          {
            type_name: "SelectOption",
            value: "&genre=%E8%A3%8F%E7%95%AA",
            name: "Lifan"
          },
          {
            type_name: "SelectOption",
            value: "&genre=%E6%B3%A1%E9%BA%B5%E7%95%AA",
            name: "Instant Noodles"
          },
          {
            type_name: "SelectOption",
            value: "&genre=Motion%20Anime",
            name: "Motion Anime"
          },
          {
            type_name: "SelectOption",
            value: "&genre=3D%E5%8B%95%E7%95%AB",
            name: "3D Animation"
          },
          {
            type_name: "SelectOption",
            value: "&genre=%E5%90%8C%E4%BA%BA%E4%BD%9C%E5%93%81",
            name: "Fan Works"
          },
          {
            type_name: "SelectOption",
            value: "&genre=Cosplay",
            name: "Cosplay"
          }
        ]
      },
      {
        type: "tags",
        name: "Tags",
        type_name: "GroupFilter",
        state: [{
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%84%A1%E7%A2%BC",
            state: false,
            name: "Uncensored"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=AI%E8%A7%A3%E7%A2%BC",
            state: false,
            name: "AI Decoding"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%B8%AD%E6%96%87%E5%AD%97%E5%B9%95",
            state: false,
            name: "Chinese subtitles"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=1080p",
            state: false,
            name: "1080p"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=60FPS",
            state: false,
            name: "60FPS"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=ASMR",
            state: false,
            name: "ASMR"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%BF%91%E8%A6%AA",
            state: false,
            name: "Close relatives"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A7%90",
            state: false,
            name: "Older sister"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A6%B9",
            state: false,
            name: "Younger sister"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%AF%8D",
            state: false,
            name: "Mother"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A5%B3%E5%85%92",
            state: false,
            name: "Daughter"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%B8%AB%E7%94%9F",
            state: false,
            name: "Teachers and Students"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%83%85%E4%BE%B6",
            state: false,
            name: "Couple"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%9D%92%E6%A2%85%E7%AB%B9%E9%A6%AC",
            state: false,
            name: "Childhood sweetheart"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%90%8C%E4%BA%8B",
            state: false,
            name: "colleague"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=JK",
            state: false,
            name: "JK"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%99%95%E5%A5%B3",
            state: false,
            name: "Virgin"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%BE%A1%E5%A7%90",
            state: false,
            name: "Royal sister"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%86%9F%E5%A5%B3",
            state: false,
            name: "MILF"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%BA%BA%E5%A6%BB",
            state: false,
            name: "Wife"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%80%81%E5%B8%AB",
            state: false,
            name: "teacher"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A5%B3%E9%86%AB%E8%AD%B7%E5%A3%AB",
            state: false,
            name: "Female nurse"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=OL",
            state: false,
            name: "OL"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A4%A7%E5%B0%8F%E5%A7%90",
            state: false,
            name: "Missy"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%81%B6%E5%83%8F",
            state: false,
            name: "Idol"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A5%B3%E5%83%95",
            state: false,
            name: "Maid"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%B7%AB%E5%A5%B3",
            state: false,
            name: "Miko"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%BF%AE%E5%A5%B3",
            state: false,
            name: "nun"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%A2%A8%E4%BF%97%E5%A8%98",
            state: false,
            name: "Custom Girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%85%AC%E4%B8%BB",
            state: false,
            name: "Princess"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A5%B3%E6%88%B0%E5%A3%AB",
            state: false,
            name: "Female Warrior"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3",
            state: false,
            name: "Magical Girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%95%B0%E7%A8%AE%E6%97%8F",
            state: false,
            name: "Different race"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A6%96%E7%B2%BE",
            state: false,
            name: "Fairy"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%AD%94%E7%89%A9%E5%A8%98",
            state: false,
            name: "Monster Girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%8D%B8%E5%A8%98",
            state: false,
            name: "Beast Girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%A2%A7%E6%B1%A0",
            state: false,
            name: "Bichi"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%97%B4%E5%A5%B3",
            state: false,
            name: "Nude"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%9B%8C%E5%B0%8F%E9%AC%BC",
            state: false,
            name: "Female ghost"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%B8%8D%E8%89%AF%E5%B0%91%E5%A5%B3",
            state: false,
            name: "Bad Girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%82%B2%E5%AC%8C",
            state: false,
            name: "Tsundere"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%97%85%E5%AC%8C",
            state: false,
            name: "yandere"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%84%A1%E5%8F%A3",
            state: false,
            name: "Silent"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%81%BD%E5%A8%98",
            state: false,
            name: "transvestite"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%89%B6%E4%BB%96",
            state: false,
            name: "Futa"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%9F%AD%E9%AB%AE",
            state: false,
            name: "short hair"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%A6%AC%E5%B0%BE",
            state: false,
            name: "ponytail"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%9B%99%E9%A6%AC%E5%B0%BE",
            state: false,
            name: "Twin ponytails"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%B7%A8%E4%B9%B3",
            state: false,
            name: "Big Breasts"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%B2%A7%E4%B9%B3",
            state: false,
            name: "Small breasts"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%BB%91%E7%9A%AE%E8%86%9A",
            state: false,
            name: "dark skin"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%9C%BC%E9%8F%A1%E5%A8%98",
            state: false,
            name: "Glasses girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%8D%B8%E8%80%B3",
            state: false,
            name: "animal ears"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%BE%8E%E4%BA%BA%E7%97%A3",
            state: false,
            name: "Beauty mark"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%82%8C%E8%82%89%E5%A5%B3",
            state: false,
            name: "Muscle woman"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%99%BD%E8%99%8E",
            state: false,
            name: "White Tiger"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%99%B0%E6%AF%9B",
            state: false,
            name: "pubic hair"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%85%8B%E6%AF%9B",
            state: false,
            name: "Armpit Hair"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A4%A7%E5%B1%8C",
            state: false,
            name: "Big Dick"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%B0%B4%E6%89%8B%E6%9C%8D",
            state: false,
            name: "Sailor Suit"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%AB%94%E6%93%8D%E6%9C%8D",
            state: false,
            name: "gymnastics uniform"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%B3%B3%E8%A3%9D",
            state: false,
            name: "swimsuit"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%AF%94%E5%9F%BA%E5%B0%BC",
            state: false,
            name: "Bikini"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%92%8C%E6%9C%8D",
            state: false,
            name: "kimono"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%85%94%E5%A5%B3%E9%83%8E",
            state: false,
            name: "Bunny Girl"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%9C%8D%E8%A3%99",
            state: false,
            name: "apron"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%95%A6%E5%95%A6%E9%9A%8A",
            state: false,
            name: "Cheerleading"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%97%97%E8%A2%8D",
            state: false,
            name: "cheongsam"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%B5%B2%E8%A5%AA",
            state: false,
            name: "stockings"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%90%8A%E8%A5%AA%E5%B8%B6",
            state: false,
            name: "garters"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%86%B1%E8%A4%B2",
            state: false,
            name: "hot pants"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%BF%B7%E4%BD%A0%E8%A3%99",
            state: false,
            name: "mini skirt"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%80%A7%E6%84%9F%E5%85%A7%E8%A1%A3",
            state: false,
            name: "Sexy lingerie"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%B8%81%E5%AD%97%E8%A4%B2",
            state: false,
            name: "thong"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%AB%98%E8%B7%9F%E9%9E%8B",
            state: false,
            name: "High heel"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%B7%AB%E7%B4%8B",
            state: false,
            name: "Obscene lines"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%B4%94%E6%84%9B",
            state: false,
            name: "pure love"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%88%80%E6%84%9B%E5%96%9C%E5%8A%87",
            state: false,
            name: "romantic comedy"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%BE%8C%E5%AE%AE",
            state: false,
            name: "harem"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%96%8B%E5%A4%A7%E8%BB%8A",
            state: false,
            name: "drive a big car"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%85%AC%E7%9C%BE%E5%A0%B4%E5%90%88",
            state: false,
            name: "public places"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=NTR",
            state: false,
            name: "NTR"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%B2%BE%E7%A5%9E%E6%8E%A7%E5%88%B6",
            state: false,
            name: "Mind Control"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%97%A5%E7%89%A9",
            state: false,
            name: "drug"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%97%B4%E6%BC%A2",
            state: false,
            name: "Molester"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%98%BF%E5%98%BF%E9%A1%8F",
            state: false,
            name: "Aheyan"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%B2%BE%E7%A5%9E%E5%B4%A9%E6%BD%B0",
            state: false,
            name: "nervous breakdown"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%8D%B5%E5%A5%87",
            state: false,
            name: "Curiosity"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=BDSM",
            state: false,
            name: "BDSM"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%B6%91%E7%B6%81",
            state: false,
            name: "bundle"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%9C%BC%E7%BD%A9",
            state: false,
            name: "Eye mask"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%A0%85%E5%9C%88",
            state: false,
            name: "necklace"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%AA%BF%E6%95%99",
            state: false,
            name: "training"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%95%B0%E7%89%A9%E6%8F%92%E5%85%A5",
            state: false,
            name: "Foreign body insertion"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%82%89%E4%BE%BF%E5%99%A8",
            state: false,
            name: "Flesh toilet"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%83%83%E5%87%B8",
            state: false,
            name: "Stomach bulge"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%BC%B7%E5%88%B6",
            state: false,
            name: "force"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%BC%AA%E5%A7%A6",
            state: false,
            name: "gang rape"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%87%8C%E8%BE%B1",
            state: false,
            name: "Humiliation"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%80%A7%E6%9A%B4%E5%8A%9B",
            state: false,
            name: "Sexual violence"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%80%86%E5%BC%B7%E5%88%B6",
            state: false,
            name: "Counter coercion"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A5%B3%E7%8E%8B%E6%A8%A3",
            state: false,
            name: "Queenlike"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%AF%8D%E5%A5%B3%E4%B8%BC",
            state: false,
            name: "Mother and Daughter Donburi"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%A7%90%E5%A6%B9%E4%B8%BC",
            state: false,
            name: "Sisters Donburi"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%87%BA%E8%BB%8C",
            state: false,
            name: "Cheating"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%94%9D%E5%BD%B1",
            state: false,
            name: "photography"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%9D%A1%E7%9C%A0%E5%A7%A6",
            state: false,
            name: "sleep rape"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%A9%9F%E6%A2%B0%E5%A7%A6",
            state: false,
            name: "Mechanical rape"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%80%A7%E8%BD%89%E6%8F%9B",
            state: false,
            name: "sexual conversion"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%99%BE%E5%90%88",
            state: false,
            name: "lily"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%80%BD%E7%BE%8E",
            state: false,
            name: "Danmei"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%95%B0%E4%B8%96%E7%95%8C",
            state: false,
            name: "Another world"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%80%AA%E7%8D%B8",
            state: false,
            name: "monster"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%B8%96%E7%95%8C%E6%9C%AB%E6%97%A5",
            state: false,
            name: "The End of the World"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%89%8B%E4%BA%A4",
            state: false,
            name: "Handjob"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%8C%87%E4%BA%A4",
            state: false,
            name: "Fingering"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E4%B9%B3%E4%BA%A4",
            state: false,
            name: "Titty fuck"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%82%9B%E4%BA%A4",
            state: false,
            name: "Anal sex"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%85%B3%E4%BA%A4",
            state: false,
            name: "Footjob"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%8B%B3%E4%BA%A4",
            state: false,
            name: "Fisting"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=3P",
            state: false,
            name: "3P"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E7%BE%A4%E4%BA%A4",
            state: false,
            name: "Group Sex"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%8F%A3%E4%BA%A4",
            state: false,
            name: "oral sex"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%8F%A3%E7%88%86",
            state: false,
            name: "BJ"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%90%9E%E7%B2%BE",
            state: false,
            name: "Swallowing sperm"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%88%94%E8%9B%8B%E8%9B%8B",
            state: false,
            name: "Licking balls"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%88%94%E7%A9%B4",
            state: false,
            name: "Licking pussy"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=69",
            state: false,
            name: "69"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%87%AA%E6%85%B0",
            state: false,
            name: "Masturbation"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%85%8B%E4%BA%A4",
            state: false,
            name: "Armpit"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%88%94%E8%85%8B%E4%B8%8B",
            state: false,
            name: "Licking armpits"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%85%A7%E5%B0%84",
            state: false,
            name: "Creampie"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%A1%8F%E5%B0%84",
            state: false,
            name: "Facial cumshot"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%9B%99%E6%B4%9E%E9%BD%8A%E4%B8%8B",
            state: false,
            name: "Double holes"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%87%B7%E5%AD%95",
            state: false,
            name: "pregnant"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E5%99%B4%E5%A5%B6",
            state: false,
            name: "Milk spray"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%94%BE%E5%B0%BF",
            state: false,
            name: "Urinating"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%8E%92%E4%BE%BF",
            state: false,
            name: "Defecation"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%A1%8F%E9%9D%A2%E9%A8%8E%E4%B9%98",
            state: false,
            name: "Face riding"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%BB%8A%E9%9C%87",
            state: false,
            name: "Car Sex"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%80%A7%E7%8E%A9%E5%85%B7",
            state: false,
            name: "Sex toys"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E6%AF%92%E9%BE%8D%E9%91%BD",
            state: false,
            name: "Dragon Diamond"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%A7%B8%E6%89%8B",
            state: false,
            name: "Tentacles"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E9%A0%B8%E6%89%8B%E6%9E%B7",
            state: false,
            name: "Neck and Handcuffs"
          },
          {
            type_name: "CheckBox",
            value: "&tags%5B%5D=%E8%91%97%E8%A1%A3",
            state: false,
            name: "Clothing"
          }
        ]
      },
      {
        type: "sort",
        name: "Sorting",
        type_name: "SelectFilter",
        values: [{
            type_name: "SelectOption",
            value: "&sort=%E6%9C%80%E6%96%B0%E4%B8%8A%E5%B8%82",
            name: "Latest Listings"
          },
          {
            type_name: "SelectOption",
            value: "&sort=%E6%9C%80%E6%96%B0%E4%B8%8A%E5%82%B3",
            name: "Latest uploads"
          },
          {
            type_name: "SelectOption",
            value: "&sort=%E6%9C%AC%E6%97%A5%E6%8E%92%E8%A1%8C",
            name: "Today's ranking"
          },
          {
            type_name: "SelectOption",
            value: "&sort=%E6%9C%AC%E9%80%B1%E6%8E%92%E8%A1%8C",
            name: "This week's ranking"
          },
          {
            type_name: "SelectOption",
            value: "&sort=%E6%9C%AC%E6%9C%88%E6%8E%92%E8%A1%8C",
            name: "This month's ranking"
          },
          {
            type_name: "SelectOption",
            value: "&sort=%E8%A7%80%E7%9C%8B%E6%AC%A1%E6%95%B8",
            name: "Views"
          },
          {
            type_name: "SelectOption",
            value: "&sort=%E4%BB%96%E5%80%91%E5%9C%A8%E7%9C%8B",
            name: "They are watching"
          }
        ]
      }
    ];
  }
  getSourcePreferences() {
    throw new Error("getSourcePreferences not implemented");
  }
}
