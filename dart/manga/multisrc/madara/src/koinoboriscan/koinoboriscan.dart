import '../../../../../../model/source.dart';

Source get koinoboriscanSource => _koinoboriscanSource;
Source _koinoboriscanSource = Source(
    name: "Koinobori Scan",
    baseUrl: "https://koinoboriscan.com",
    lang: "es",
    isNsfw:true,
    typeSource: "madara",
    iconUrl: "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/main/dart/manga/multisrc/madara/src/koinoboriscan/icon.png",
    dateFormat:"MMMM dd, yyyy",
    dateFormatLocale:"es"
  );
