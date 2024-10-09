const mangayomiSources = [{
  "name": "Jable",
  "lang": "zh",
  "baseUrl": "https://jable.tv",
  "apiUrl": "",
  "iconUrl": "https://assets-cdn.jable.tv/assets/icon/favicon-32x32.png",
  "typeSource": "single",
  "isManga": false,
  "isNsfw": true,
  "version": "0.0.2",
  "dateFormat": "",
  "dateFormatLocale": "",
  "pkgPath": "anime/src/zh/jable.js",
  "hasCloudflare": true
}];

class DefaultExtension extends MProvider {
  async getItems(url) {
    const res = await new Client().get(this.source.baseUrl + url);
    const doc = new Document(res.body);
    const elements = doc.select("div.video-img-box");
    const items = [];
    for (const element of elements) {
      const title = element.selectFirst("h6.title").text;
      const cover = element.selectFirst("div.img-box a img").attr("data-src");
      const url = element.selectFirst("a").attr("href");
      items.push({
        name: title,
        imageUrl: cover,
        link: url
      });
    }
    return {
      list: items,
      hasNextPage: true
    };
  }

  async getPopular(page) {
    return await this.getItems(`/hot/${page}/`);
  }

  async getLatestUpdates(page) {
    return await this.getItems(`/latest-updates/${page}/`);
  }

  async search(query, page, filters) {
    if (query != "") {
      return await this.getItems(`/search/${query}/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&q=${query}&sort_by=&from=${page}`);
    }
    var categories, sort;
    for (const filter of filters) {
      if (filter["type"] == "categories") {
        categories = filter["values"][filter["state"]]["value"];
      }
      else if (filter["type"] == "sort") {
        sort = filter["values"][filter["state"]]["value"];
      }
    }
    return await this.getItems(`${categories}?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=${sort}&from=${page}`);
  }

  async getDetail(url) {
    const res = await new Client().get(url);
    const doc = new Document(res.body);
    const title = doc.selectFirst("div.header-left h4").text;
    const cover = doc.selectFirst("video#player").attr("poster");
    const tags = doc.select("h5.tags a").map(e => e.text);
    const actor = doc.selectFirst("div.models span").attr("title");
    const vid_url = res.body.match(/hlsUrl\s*=\s*'([^']*)'/)[1];
    return {
      name: title,
      imageUrl: cover,
      genre: tags,
      author: actor,
      description: "",
      episodes: [{
        name: title,
        url: vid_url
      }]
    };
  }

  async getVideoList(url) {
    return [{
      url: url,
      originalUrl: url,
      quality: "HLS"
    }];
  }

  getFilterList() {
    return [{
      type: "categories",
      name: "Categories",
      type_name: "SelectFilter",
      values: [{
          name: "Roleplay",
          value: "/categories/roleplay/",
          type_name: "SelectOption"
        },
        {
          name: "Chinese subtitle",
          value: "/categories/chinese-subtitle/",
          type_name: "SelectOption"
        },
        {
          name: "Uniform",
          value: "/categories/uniform/",
          type_name: "SelectOption"
        },
        {
          name: "Sex only",
          value: "/categories/sex-only/",
          type_name: "SelectOption"
        },
        {
          name: "Pantyhose",
          value: "/categories/pantyhose/",
          type_name: "SelectOption"
        },
        {
          name: "BDSM",
          value: "/categories/bdsm/",
          type_name: "SelectOption"
        },
        {
          name: "Group sex",
          value: "/categories/groupsex/",
          type_name: "SelectOption"
        },
        {
          name: "POV",
          value: "/categories/pov/",
          type_name: "SelectOption"
        },
        {
          name: "Rape",
          value: "/categories/rape/",
          type_name: "SelectOption"
        },
        {
          name: "Uncensored",
          value: "/categories/uncensored/",
          type_name: "SelectOption"
        },
        {
          name: "Hidden cam",
          value: "/categories/hidden-cam/",
          type_name: "SelectOption"
        },
        {
          name: "Lessbian",
          value: "/categories/lesbian/",
          type_name: "SelectOption"
        },
        {
          name: "Black pantyhose",
          value: "/tags/black-pantyhose/",
          type_name: "SelectOption"
        },
        {
          name: "Knee socks",
          value: "/tags/knee-socks/",
          type_name: "SelectOption"
        },
        {
          name: "Sportwear",
          value: "/tags/sportswear/",
          type_name: "SelectOption"
        },
        {
          name: "Flesh toned pantyhose",
          value: "/tags/flesh-toned-pantyhose/",
          type_name: "SelectOption"
        },
        {
          name: "Pantyhose",
          value: "/tags/pantyhose/",
          type_name: "SelectOption"
        },
        {
          name: "Glasses",
          value: "/tags/glasses/",
          type_name: "SelectOption"
        },
        {
          name: "Kemonomimi",
          value: "/tags/kemonomimi/",
          type_name: "SelectOption"
        },
        {
          name: "Fishnets",
          value: "/tags/fishnets/",
          type_name: "SelectOption"
        },
        {
          name: "Swimsuit",
          value: "/tags/swimsuit/",
          type_name: "SelectOption"
        },
        {
          name: "School uniform",
          value: "/tags/school-uniform/",
          type_name: "SelectOption"
        },
        {
          name: "Cheongsam",
          value: "/tags/cheongsam/",
          type_name: "SelectOption"
        },
        {
          name: "Wedding dress",
          value: "/tags/wedding-dress/",
          type_name: "SelectOption"
        },
        {
          name: "Maid",
          value: "/tags/maid/",
          type_name: "SelectOption"
        },
        {
          name: "Kimono",
          value: "/tags/kimono/",
          type_name: "SelectOption"
        },
        {
          name: "Stockings",
          value: "/tags/stockings/",
          type_name: "SelectOption"
        },
        {
          name: "Bunny girl",
          value: "/tags/bunny-girl/",
          type_name: "SelectOption"
        },
        {
          name: "Cosplay",
          value: "/tags/Cosplay/",
          type_name: "SelectOption"
        },
        {
          name: "Suntan",
          value: "/tags/suntan/",
          type_name: "SelectOption"
        },
        {
          name: "Tall",
          value: "/tags/tall/",
          type_name: "SelectOption"
        },
        {
          name: "Flexible body",
          value: "/tags/flexible-body/",
          type_name: "SelectOption"
        },
        {
          name: "Small tits",
          value: "/tags/small-tits/",
          type_name: "SelectOption"
        },
        {
          name: "loli",
          value: "/tags/loli/",
          type_name: "SelectOption"
        },
        {
          name: "Beautiful leg",
          value: "/tags/beautiful-leg/",
          type_name: "SelectOption"
        },
        {
          name: "Beautiful butt",
          value: "/tags/beautiful-butt/",
          type_name: "SelectOption"
        },
        {
          name: "Tattoo",
          value: "/tags/tattoo/",
          type_name: "SelectOption"
        },
        {
          name: "Short hair",
          value: "/tags/short-hair/",
          type_name: "SelectOption"
        },
        {
          name: "Hairless pussy",
          value: "/tags/hairless-pussy/",
          type_name: "SelectOption"
        },
        {
          name: "Mature woman",
          value: "/tags/mature-woman/",
          type_name: "SelectOption"
        },
        {
          name: "Big tits",
          value: "/tags/big-tits/",
          type_name: "SelectOption"
        },
        {
          name: "Girl",
          value: "/tags/girl/",
          type_name: "SelectOption"
        },
        {
          name: "Facial",
          value: "/tags/facial/",
          type_name: "SelectOption"
        },
        {
          name: "Footjob",
          value: "/tags/footjob/",
          type_name: "SelectOption"
        },
        {
          name: "Anal sex",
          value: "/tags/anal-sex/",
          type_name: "SelectOption"
        },
        {
          name: "Spasms",
          value: "/tags/spasms/",
          type_name: "SelectOption"
        },
        {
          name: "Squirting",
          value: "/tags/squirting/",
          type_name: "SelectOption"
        },
        {
          name: "Deep throat",
          value: "/tags/deep-throat/",
          type_name: "SelectOption"
        },
        {
          name: "Kiss",
          value: "/tags/kiss/",
          type_name: "SelectOption"
        },
        {
          name: "Cum in mouth",
          value: "/tags/cum-in-mouth/",
          type_name: "SelectOption"
        },
        {
          name: "BJ",
          value: "/tags/blowjob/",
          type_name: "SelectOption"
        },
        {
          name: "Tit wank",
          value: "/tags/tit-wank/",
          type_name: "SelectOption"
        },
        {
          name: "Creampie",
          value: "/tags/creampie/",
          type_name: "SelectOption"
        },
        {
          name: "Outdoor",
          value: "/tags/outdoor/",
          type_name: "SelectOption"
        },
        {
          name: "Gang rape",
          value: "/tags/gang-rape/",
          type_name: "SelectOption"
        },
        {
          name: "Tune",
          value: "/tags/tune/",
          type_name: "SelectOption"
        },
        {
          name: "Bondage",
          value: "/tags/bondage/",
          type_name: "SelectOption"
        },
        {
          name: "Quickie",
          value: "/tags/quickie/",
          type_name: "SelectOption"
        },
        {
          name: "Chikan",
          value: "/tags/chikan/",
          type_name: "SelectOption"
        },
        {
          name: "Chizyo",
          value: "/tags/chizyo/",
          type_name: "SelectOption"
        },
        {
          name: "Masochism guy",
          value: "/tags/masochism-guy/",
          type_name: "SelectOption"
        },
        {
          name: "Crapulence",
          value: "/tags/crapulence/",
          type_name: "SelectOption"
        },
        {
          name: "Soapland",
          value: "/tags/soapland/",
          type_name: "SelectOption"
        },
        {
          name: "Breast milk",
          value: "/tags/breast-milk/",
          type_name: "SelectOption"
        },
        {
          name: "Piss",
          value: "/tags/piss/",
          type_name: "SelectOption"
        },
        {
          name: "Massage",
          value: "/tags/massage/",
          type_name: "SelectOption"
        },
        {
          name: "Rape",
          value: "/tags/rape/",
          type_name: "SelectOption"
        },
        {
          name: "Gangbang",
          value: "/tags/gangbang/",
          type_name: "SelectOption"
        },
        {
          name: "Torture",
          value: "/tags/torture/",
          type_name: "SelectOption"
        },
        {
          name: "Insult",
          value: "/tags/insult/",
          type_name: "SelectOption"
        },
        {
          name: "10 times a day",
          value: "/tags/10-times-a-day/",
          type_name: "SelectOption"
        },
        {
          name: "3P",
          value: "/tags/3p/",
          type_name: "SelectOption"
        },
        {
          name: "Black",
          value: "/tags/black/",
          type_name: "SelectOption"
        },
        {
          name: "Ugly man",
          value: "/tags/ugly-man/",
          type_name: "SelectOption"
        },
        {
          name: "Temptation",
          value: "/tags/temptation/",
          type_name: "SelectOption"
        },
        {
          name: "Virginity",
          value: "/tags/virginity/",
          type_name: "SelectOption"
        },
        {
          name: "Time Stop",
          value: "/tags/time-stop/",
          type_name: "SelectOption"
        },
        {
          name: "Avenge",
          value: "/tags/avenge/",
          type_name: "SelectOption"
        },
        {
          name: "Age difference",
          value: "/tags/age-difference/",
          type_name: "SelectOption"
        },
        {
          name: "Giant",
          value: "/tags/giant/",
          type_name: "SelectOption"
        },
        {
          name: "Live potion",
          value: "/tags/love-potion/",
          type_name: "SelectOption"
        },
        {
          name: "Sex beside husband",
          value: "/tags/sex-beside-husband/",
          type_name: "SelectOption"
        },
        {
          name: "Affair",
          value: "/tags/affair/",
          type_name: "SelectOption"
        },
        {
          name: "Hyponosis",
          value: "/tags/hypnosis/",
          type_name: "SelectOption"
        },
        {
          name: "Hidden Cam",
          value: "/tags/hidden-cam/",
          type_name: "SelectOption"
        },
        {
          name: "Incest",
          value: "/tags/incest/",
          type_name: "SelectOption"
        },
        {
          name: "Rainy day",
          value: "/tags/rainy-day/",
          type_name: "SelectOption"
        },
        {
          name: "NTR",
          value: "/tags/ntr/",
          type_name: "SelectOption"
        },
        {
          name: "Club hostess and sex worker",
          value: "/tags/club-hostess-and-sex-worker/",
          type_name: "SelectOption"
        },
        {
          name: "Doctor",
          value: "/tags/doctor/",
          type_name: "SelectOption"
        },
        {
          name: "Fugitive",
          value: "/tags/fugitive/",
          type_name: "SelectOption"
        },
        {
          name: "Nurse",
          value: "/tags/nurse/",
          type_name: "SelectOption"
        },
        {
          name: "Teacher",
          value: "/tags/teacher/",
          type_name: "SelectOption"
        },
        {
          name: "Flight attendant",
          value: "/tags/flight-attendant/",
          type_name: "SelectOption"
        },
        {
          name: "Team manager",
          value: "/tags/team-manager/",
          type_name: "SelectOption"
        },
        {
          name: "Widow",
          value: "/tags/widow/",
          type_name: "SelectOption"
        },
        {
          name: "Detective",
          value: "/tags/detective/",
          type_name: "SelectOption"
        },
        {
          name: "Couple",
          value: "/tags/couple/",
          type_name: "SelectOption"
        },
        {
          name: "Housewife",
          value: "/tags/housewife/",
          type_name: "SelectOption"
        },
        {
          name: "Private Teacher",
          value: "/tags/private-teacher/",
          type_name: "SelectOption"
        },
        {
          name: "Idol",
          value: "/tags/idol/",
          type_name: "SelectOption"
        },
        {
          name: "Wife",
          value: "/tags/wife/",
          type_name: "SelectOption"
        },
        {
          name: "Female anchor",
          value: "/tags/female-anchor/",
          type_name: "SelectOption"
        },
        {
          name: "OL",
          value: "/tags/ol/",
          type_name: "SelectOption"
        },
        {
          name: "Magic Mirror",
          value: "/tags/magic-mirror/",
          type_name: "SelectOption"
        },
        {
          name: "Tram",
          value: "/tags/tram/",
          type_name: "SelectOption"
        },
        {
          name: "First Night",
          value: "/tags/first-night/",
          type_name: "SelectOption"
        },
        {
          name: "Prison",
          value: "/tags/prison/",
          type_name: "SelectOption"
        },
        {
          name: "Hot spring",
          value: "/tags/hot-spring/",
          type_name: "SelectOption"
        },
        {
          name: "Bathing place",
          value: "/tags/bathing-place/",
          type_name: "SelectOption"
        },
        {
          name: "Swimming pool",
          value: "/tags/swimming-pool/",
          type_name: "SelectOption"
        },
        {
          name: "Car",
          value: "/tags/car/",
          type_name: "SelectOption"
        },
        {
          name: "Toilet",
          value: "/tags/toilet/",
          type_name: "SelectOption"
        },
        {
          name: "School",
          value: "/tags/school/",
          type_name: "SelectOption"
        },
        {
          name: "Library",
          value: "/tags/library/",
          type_name: "SelectOption"
        },
        {
          name: "Gym room",
          value: "/tags/gym-room/",
          type_name: "SelectOption"
        },
        {
          name: "Store",
          value: "/tags/store/",
          type_name: "SelectOption"
        },
        {
          name: "Video recording",
          value: "/tags/video-recording/",
          type_name: "SelectOption"
        },
        {
          name: "Debut/Retires",
          value: "/tags/debut-retires/",
          type_name: "SelectOption"
        },
        {
          name: "Variety Show",
          value: "/tags/variety-show/",
          type_name: "SelectOption"
        },
        {
          name: "Festival",
          value: "/tags/festival/",
          type_name: "SelectOption"
        },
        {
          name: "Thanksgiving",
          value: "/tags/thanksgiving/",
          type_name: "SelectOption"
        },
        {
          name: "More than 4 hours",
          value: "/tags/more-than-4-hours/",
          type_name: "SelectOption"
        }
      ]
    },
    {
      type: "sort",
      name: "Sort by",
      type_name: "SelectFilter",
      values: [{
          name: "Post date and popularity",
          value: "post_date_and_popularity",
          type_name: "SelectOption"
        },
        {
          name: "Post date",
          value: "post_date",
          type_name: "SelectOption"
        },
        {
          name: "Video viewed",
          value: "video_viewed",
          type_name: "SelectOption"
        },
        {
          name: "Most favourited",
          value: "most_favourited",
          type_name: "SelectOption"
        }
      ]
    }]
  }

  getSourcePreferences() {
    throw new Error("getSourcePreferences not implemented");
  }
}
