import '../../../../../../model/source.dart';

Source get madaradexSource => _madaradexSource;
Source _madaradexSource = Source(
    name: "MadaraDex",
    baseUrl: "https://madaradex.org",
    lang: "en",
    isNsfw:true,
    typeSource: "madara",
    iconUrl: "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/main/dart/manga/multisrc/madara/src/madaradex/icon.png",
    dateFormat:"MMM d, yyyy",
    dateFormatLocale:"en_us"
  );
