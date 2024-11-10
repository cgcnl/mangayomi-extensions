const mangayomiSources = [{
    "name": "Njav",
    "lang": "all",
    "baseUrl": "https://njav.tv/en",
    "apiUrl": "",
    "iconUrl": "https://njav.tv/assets/njav/images/favicon.png",
    "typeSource": "single",
    "isManga": false,
    "isNsfw": true,
    "version": "0.0.4",
    "apiUrl": "",
    "dateFormat": "",
    "dateFormatLocale": "",
    "pkgName": "anime/src/all/njav.js"
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
  
    async request(url) {
      const preference = new SharedPreferences();
      const res = await new Client().get(preference.get("url") + "/" + preference.get("lang") + url);
      return res.body;
    }
  
    async getItems(url) {
      const res = await this.request(url);
      const doc = new Document(res);
      const elements = doc.select(".box-item-list .box-item");
      const items = [];
      for (const element of elements) {
        const cover = element.selectFirst("img").attr("data-src");
        const info = element.selectFirst("div.detail a");
        const url = info.attr("href");
        const title = info.text;
        items.push({
          link: "/" + url,
          imageUrl: cover,
          name: title
        });
      }
      console.log(items.length);
      return {
        list: items,
        hasNextPage: true
      }
    }
  
    async getPopular(page) {
      return await this.getItems(`/trending?page=${page}`);
    }
  
    async getLatestUpdates(page) {
      return await this.getItems(`/new-release?page=${page}`);
    }
  
    async search(query, page, filters) {
      if (query == "") {
        var category, sort;
        for (const filter of filters) {
          if (filter["type"] == "CateFilter") {
            category = filter["values"][filter["state"]]["value"];
          } else if (filter["type"] == "SortFilter") {
            sort = filter["values"][filter["state"]]["value"];
          }
        }
        return await this.getItems(`/${category}?sort=${sort}&page=${page}`);
      } else {
        return await this.getItems(`/search?keyword=${query}&page=${page}`);
      }
    }
  
    async getEpisodes(id, time) {
      const res = await this.request(`/ajax/v/${id}/videos`);
      const datas = JSON.parse(res);
      const ep = [];
      for (const data of datas["data"]["watch"]) {
        ep.push({
          name: data["name"],
          url: data["url"],
          dateUpload: time.toString()
        });
      }
      return ep;
    }
  
    async getDetail(url) {
      const res = await this.request(url);
      const doc = new Document(res);
      const body = doc.selectFirst("div#body");
      const title = body.selectFirst("h1").text;
      const cover = body.selectFirst("div#player").attr("data-poster");
      const info = body.selectFirst("div.detail-item").select("div");
      var desc;
      try {
        desc = body.selectFirst("div.description p").text;
      } catch {
        desc = "";
      }
      const updateTime = this.dateStringToTimestamp(info[1].select("span")[1].text);
      var author;
      try {
        author = info[3].select("span")[1].text.replaceAll("\n", "");
      } catch {
        author = "Unknown";
      }
      var genres
      try {
        genres = info[4].selectFirst("span.genre").select("a").map(e => e.text);
      } catch {
        genres = [];
      }
      const v_scope = body.selectFirst("div.container").attr("v-scope");
      const comma_idx = v_scope.indexOf(",");
      const start_idx = v_scope.indexOf("id: ") + 4;
      const id = v_scope.slice(start_idx, comma_idx);
      const eps = await this.getEpisodes(id, updateTime);
      return {
        name: title,
        imageUrl: cover,
        author: author,
        genre: genres,
        description: desc,
        episodes: eps
      };
    }
  
    async getVideoList(url) {
      const res = await new Client().get(url);
      const doc = new Document(res.body);
      const str = doc.selectFirst("div#player").attr("v-scope").match(/, {([^']*)\)/)[1];
      const data = JSON.parse("{" + str);
      return [{
        url: data["stream"],
        originalUrl: data["stream"],
        quality: "Origin",
        headers: {
          Referer: "https://javplayer.me/",
          Origin: "https://javplayer.me"
        }
      }];
    }
  
    getFilterList() {
      return [{
          "type": "CateFilter",
          "type_name": "SelectFilter",
          "name": "Category",
          "values": [{
              "value": "recommended",
              "name": "Recommended",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/censored",
              "name": "Censored",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/uncensored",
              "name": "Uncensored",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/uncensored-leaked",
              "name": "Uncensored Leaked",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/vr",
              "name": "VR",
              "type_name": "SelectOption"
            },
            {
              "value": "dm4/tags/fc2",
              "name": "FC2",
              "type_name": "SelectOption"
            },
            {
              "value": "dm11/tags/heyzo",
              "name": "HEYZO",
              "type_name": "SelectOption"
            },
            {
              "value": "dm4/tags/tokyo-hot",
              "name": "Tokyo-Hot",
              "type_name": "SelectOption"
            },
            {
              "value": "dm11/tags/1pondo",
              "name": "1pondo",
              "type_name": "SelectOption"
            },
            {
              "value": "dm8/tags/caribbeancom",
              "name": "Caribbeancom",
              "type_name": "SelectOption"
            },
            {
              "value": "dm5/tags/caribbeancompr",
              "name": "Caribbeancompr",
              "type_name": "SelectOption"
            },
            {
              "value": "dm9/tags/10musume",
              "name": "10musume",
              "type_name": "SelectOption"
            },
            {
              "value": "dm7/tags/pacopacomama",
              "name": "pacopacomama",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/gachig",
              "name": "Gachinco",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/xxx-av",
              "name": "XXX-AV",
              "type_name": "SelectOption"
            },
            {
              "value": "dm5/tags/c0930",
              "name": "C0930",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/h4610",
              "name": "H4610",
              "type_name": "SelectOption"
            },
            {
              "value": "dm6/tags/h0930",
              "name": "H0930",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/siro",
              "name": "SIRO",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/259luxu",
              "name": "LUXU",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/200gana",
              "name": "200GANA",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/prestige-premium",
              "name": "PRESTIGE PREMIUM",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/s-cute",
              "name": "S-CUTE",
              "type_name": "SelectOption"
            },
            {
              "value": "dm3/tags/261ara",
              "name": "ARA",
              "type_name": "SelectOption"
            }
          ]
        },
        {
          "type": "SortFilter",
          "type_name": "SelectFilter",
          "name": "Sort",
          "values": [{
              "value": "recent_update",
              "name": "Recent Update",
              "type_name": "SelectOption"
            },
            {
              "value": "release_date",
              "name": "Release date",
              "type_name": "SelectOption"
            },
            {
              "value": "trending",
              "name": "Trending",
              "type_name": "SelectOption"
            },
            {
              "value": "most_viewed_today",
              "name": "Most viewed today",
              "type_name": "SelectOption"
            },
            {
              "value": "most_viewed_week",
              "name": "Most viewed by week",
              "type_name": "SelectOption"
            },
            {
              "value": "most_viewed_month",
              "name": "Most viewed by month",
              "type_name": "SelectOption"
            },
            {
              "value": "most_viewed",
              "name": "Most viewed",
              "type_name": "SelectOption"
            }, {
              "value": "most_favourited",
              "name": "Most favourited",
              "type_name": "SelectOption"
            }
          ]
        }
      ];
  
    }
  
    getSourcePreferences() {
      return [{
          "key": "lang",
          "listPreference": {
            "title": "Language",
            "summary": "",
            "valueIndex": 0,
            "entries": ["English", "繁體中文", "日本語", "한국의", "Melayu", "ไทย", "Deutsch", "Français", "Tiếng Việt"],
            "entryValues": ["en", "zh", "ja", "ko", "ms", "th", "de", "fr", "vi"],
          }
        },
        {
          "key": "url",
          "listPreference": {
            "title": "Website Url",
            "summary": "",
            "valueIndex": 0,
            "entries": ["njav", "missav", "javgo", "supjav"],
            "entryValues": ["https://njav.xyz", "https://missav.li", "https://www.javgo.to", "https://supjav.pro"],
          }
        }
      ];
    }
  }
