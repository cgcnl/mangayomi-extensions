import 'dart:convert';
import 'package:bridge_lib/bridge_lib.dart';

Future<MHttpResponse> dataBase(int sourceId) async {
  final data = {
    "url": "https://api.franime.fr/api/animes/",
    "headers": {"Referer": "https://franime.fr/"}
  };

  return await MBridge.http('GET', json.encode(data));
}

getPopularAnime(MManga anime) async {
  final data = {
    "url": "https://api.franime.fr/api/animes/",
    "headers": {"Referer": "https://franime.fr/"}
  };
  final res = await MBridge.http('GET', json.encode(data));
  if (res.hasError) {
    return res;
  }
  List<MManga> animeList = animeResList(res.body);

  return animeList;
}

List<MManga> animeResList(String res) {
  final statusList = [
    {"EN COURS": 0, "TERMINÉ": 1}
  ];
  List<MManga> animeList = [];

  var jsonResList = json.decode(res);

  for (var animeJson in jsonResList) {
    final seasons = animeJson["saisons"];
    List<bool> vostfrListName = [];
    List<bool> vfListName = [];
    for (var season in seasons) {
      for (var episode in season["episodes"]) {
        final lang = episode["lang"];
        final vo = lang["vo"];
        final vf = lang["vf"];
        vostfrListName.add(vo["lecteurs"].isNotEmpty);
        vfListName.add(vf["lecteurs"].isNotEmpty);
      }
    }

    final titleO = animeJson["titleO"];
    final title = animeJson["title"];
    final genre = animeJson["themes"];
    final description = animeJson["description"];
    final status = MBridge.parseStatus(animeJson["status"], statusList);
    final imageUrl = animeJson["affiche"];
    bool hasVostfr = vostfrListName.contains(true);
    bool hasVf = vfListName.contains(true);
    if (hasVostfr || hasVf) {
      for (int i = 0; i < seasons.length; i++) {
        MManga anime = MManga();
        int ind = i + 1;
        anime.genre = genre;
        anime.description = description;
        String seasonTitle = "".toString();
        String lang = "";
        if (title.isEmpty) {
          seasonTitle = titleO;
        } else {
          seasonTitle = title;
        }
        if (seasons.length > 1) {
          seasonTitle += " S$ind";
        }
        if (hasVf) {
          seasonTitle += " VF";
          lang = "vf".toString();
        }
        if (hasVostfr) {
          seasonTitle += " VOSTFR";
          lang = "vo".toString();
        }

        anime.status = status;
        anime.name = seasonTitle;
        anime.imageUrl = imageUrl;
        anime.link =
            "/anime/${MBridge.regExp(titleO, "[^A-Za-z0-9 ]", "", 0, 0).replaceAll(" ", "-").toLowerCase()}?lang=$lang&s=$ind";

        animeList.add(anime);
      }
    }
  }
  return animeList;
}

String databaseAnimeByTitleO(String res, String titleO) {
  final datas = MBridge.jsonDecodeToList(res, 1);
  for (var data in datas) {
    if (MBridge.regExp(
                MBridge.getMapValue(data, "titleO"), "[^A-Za-z0-9 ]", "", 0, 0)
            .replaceAll(" ", "-")
            .toLowerCase() ==
        "${titleO}") {
      return data;
    }
  }
  return "";
}

getAnimeDetail(MManga anime) async {
  String language = "vo".toString();
  if (anime.link.contains("lang=")) {
    language = MBridge.substringBefore(
        MBridge.substringAfter(anime.link, "lang="), "&");
  }
  String stem =
      MBridge.substringBefore(MBridge.substringAfterLast(anime.link, "/"), "?");
  final res = await dataBase(anime.sourceId);
  if (res.hasError) {
    return res;
  }
  final animeByTitleOJson = databaseAnimeByTitleO(res.body, stem);
  if (animeByTitleOJson.isEmpty) {
    return anime;
  }
  final seasons = json.decode(animeByTitleOJson)["saisons"];

  var seasonsJson = seasons.first;

  if (anime.link.contains("s=")) {
    int seasonNumber = MBridge.intParse(
        MBridge.substringBefore(MBridge.substringAfter(anime.link, "s="), "&"));
    seasonsJson = seasons[seasonNumber - 1];
  }

  final episodes = seasonsJson["episodes"];

  List<String> episodesNames = [];
  List<String> episodesUrls = [];
  for (int i = 0; i < episodes.length; i++) {
    final episode = episodes[i];

    final lang = episode["lang"];

    final vo = lang["vo"];
    final vf = lang["vf"];
    bool hasVostfr = vo["lecteurs"].isNotEmpty;
    bool hasVf = vf["lecteurs"].isNotEmpty;
    bool playerIsNotEmpty = false;

    if (language == "vo" && hasVostfr) {
      playerIsNotEmpty = true;
    } else if (language == "vf" && hasVf) {
      playerIsNotEmpty = true;
    }
    if (playerIsNotEmpty) {
      episodesUrls.add("${anime.link}&ep=${i + 1}");
      String title = episode["title"];
      episodesNames.add(title.replaceAll('"', ""));
    }
  }

  anime.urls = episodesUrls.reversed.toList();
  anime.names = episodesNames.reversed.toList();
  anime.chaptersDateUploads = [];
  return anime;
}

getLatestUpdatesAnime(MManga anime) async {
  final res = await dataBase(anime.sourceId);

  if (res.hasError) {
    return res;
  }
  List list = json.decode(res.body);
  List reversedList = list.reversed.toList();
  List<MManga> animeList = animeResList(json.encode(reversedList));

  return animeList;
}

searchAnime(MManga anime) async {
  final res = await dataBase(anime.sourceId);

  if (res.hasError) {
    return res;
  }
  List<MManga> animeList = animeSeachFetch(res.body, anime.query);
  return animeList;
}

List<MManga> animeSeachFetch(String res, query) {
  final statusList = [
    {"EN COURS": 0, "TERMINÉ": 1}
  ];
  List<MManga> animeList = [];
  final jsonResList = json.decode(res);
  for (var animeJson in jsonResList) {
    MManga anime = MManga();

    final titleO = MBridge.getMapValue(json.encode(animeJson), "titleO");
    final titleAlt =
        MBridge.getMapValue(json.encode(animeJson), "titles", encode: true);
    final enContains = MBridge.getMapValue(titleAlt, "en")
        .toString()
        .toLowerCase()
        .contains(query);
    final enJpContains = MBridge.getMapValue(titleAlt, "en_jp")
        .toString()
        .toLowerCase()
        .contains(query);
    final jaJpContains = MBridge.getMapValue(titleAlt, "ja_jp")
        .toString()
        .toLowerCase()
        .contains(query);
    final titleOContains = titleO.toLowerCase().contains(query);
    bool contains = false;
    if (enContains) {
      contains = true;
    }
    if (enJpContains) {
      contains = true;
    }
    if (jaJpContains) {
      contains = true;
    }
    if (titleOContains) {
      contains = true;
    }
    if (contains) {
      final seasons = animeJson["saisons"];
      List<bool> vostfrListName = [];
      List<bool> vfListName = [];
      for (var season in seasons) {
        for (var episode in season["episodes"]) {
          final lang = episode["lang"];
          final vo = lang["vo"];
          final vf = lang["vf"];
          vostfrListName.add(vo["lecteurs"].isNotEmpty);
          vfListName.add(vf["lecteurs"].isNotEmpty);
        }
      }
      final titleO = animeJson["titleO"];
      final title = animeJson["title"];
      final genre = animeJson["themes"];
      final description = animeJson["description"];
      final status = MBridge.parseStatus(animeJson["status"], statusList);
      final imageUrl = animeJson["affiche"];

      bool hasVostfr = vostfrListName.contains(true);
      bool hasVf = vfListName.contains(true);
      if (hasVostfr || hasVf) {
        for (int i = 0; i < seasons.length; i++) {
          MManga anime = MManga();
          int ind = i + 1;
          anime.genre = genre;
          anime.description = description;
          String seasonTitle = "".toString();
          String lang = "";
          if (title.isEmpty) {
            seasonTitle = titleO;
          } else {
            seasonTitle = title;
          }
          if (seasons.length > 1) {
            seasonTitle += " S$ind";
          }
          if (hasVf) {
            seasonTitle += " VF";
            lang = "vf".toString();
          }
          if (hasVostfr) {
            seasonTitle += " VOSTFR";
            lang = "vo".toString();
          }

          anime.status = status;
          anime.name = seasonTitle;
          anime.imageUrl = imageUrl;
          anime.link =
              "/anime/${MBridge.regExp(titleO, "[^A-Za-z0-9 ]", "", 0, 0).replaceAll(" ", "-").toLowerCase()}?lang=$lang&s=$ind";

          animeList.add(anime);
        }
      }
    }
  }
  return animeList;
}

getVideoList(MManga anime) async {
  String language = "vo".toString();
  String videoBaseUrl = "https://api.franime.fr/api/anime".toString();
  if (anime.link.contains("lang=")) {
    language = MBridge.substringBefore(
        MBridge.substringAfter(anime.link, "lang="), "&");
    print(language);
  }
  String stem =
      MBridge.substringBefore(MBridge.substringAfterLast(anime.link, "/"), "?");
  final res = await dataBase(anime.sourceId);
  if (res.hasError) {
    return res;
  }
  final animeByTitleOJson = databaseAnimeByTitleO(res.body, stem);
  if (animeByTitleOJson.isEmpty) {
    return anime;
  }
  final animeId = json.decode(animeByTitleOJson)["id"];
  final seasons = json.decode(animeByTitleOJson)["saisons"];

  var seasonsJson = seasons.first;

  videoBaseUrl += "/$animeId/";

  if (anime.link.contains("s=")) {
    int seasonNumber = MBridge.intParse(
        MBridge.substringBefore(MBridge.substringAfter(anime.link, "s="), "&"));
    print(seasonNumber);
    videoBaseUrl += "${seasonNumber - 1}/";
    seasonsJson = seasons[seasonNumber - 1];
  } else {
    videoBaseUrl += "0/";
  }
  final episodesJson = seasonsJson["episodes"];
  var episode = episodesJson.first;
  if (anime.link.contains("ep=")) {
    int episodeNumber =
        MBridge.intParse(MBridge.substringAfter(anime.link, "ep="));
    print(episodeNumber);
    episode = episodesJson[episodeNumber - 1];
    videoBaseUrl += "${episodeNumber - 1}";
  } else {
    videoBaseUrl += "0";
  }
  final lang = episode["lang"];

  final vo = lang["vo"];
  final vf = lang["vf"];
  bool hasVostfr = vo["lecteurs"].isNotEmpty;
  bool hasVf = vf["lecteurs"].isNotEmpty;
  List<String> vostfrPlayers = vo["lecteurs"];
  List<String> vfPlayers = vf["lecteurs"];
  List<String> players = [];
  if (language == "vo" && hasVostfr) {
    players = vostfrPlayers;
  } else if (language == "vf" && hasVf) {
    players = vfPlayers;
  }
  List<MVideo> videos = [];
  for (var i = 0; i < players.length; i++) {
    String apiUrl = "$videoBaseUrl/$language/$i";
    String playerName = players[i];

    MVideo video = MVideo();

    final data = {
      "url": apiUrl,
      "headers": {"Referer": "https://franime.fr/"},
      "sourceId": anime.sourceId
    };
    final requestPlayerUrl = await MBridge.http('GET', json.encode(data));
    if (requestPlayerUrl.hasError) {
      return requestPlayerUrl;
    }
    String playerUrl = requestPlayerUrl.body;
    List<MVideo> a = [];
    if (playerName.contains("franime_myvi")) {
      videos.add(video
        ..url = playerUrl
        ..originalUrl = playerUrl
        ..quality = "FRAnime");
    } else if (playerName.contains("myvi")) {
      a = await MBridge.myTvExtractor(playerUrl);
    } else if (playerName.contains("sendvid")) {
      a = await MBridge.sendVidExtractor(
          playerUrl, json.encode({"Referer": "https://franime.fr/"}), "");
    } else if (playerName.contains("sibnet")) {
      a = await MBridge.sibnetExtractor(playerUrl);
    } else if (playerName.contains("sbfull")) {}
    for (var vi in a) {
      videos.add(vi);
    }
  }

  return videos;
}