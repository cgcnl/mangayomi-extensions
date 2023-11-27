import '../../../../model/source.dart';
import '../../../../utils/utils.dart';

Source get gogoanimeSource => _gogoanimeSource;
const gogoanimeVersion = "0.0.4";
const gogoanimeSourceCodeUrl =
    "https://raw.githubusercontent.com/kodjodevf/mangayomi-extensions/main/anime/src/en/gogoanime/gogoanime-v$gogoanimeVersion.dart";
Source _gogoanimeSource = Source(
    name: "Gogoanime",
    baseUrl: "https://gogoanime3.net",
    lang: "en",
    typeSource: "single",
    iconUrl: getIconUrl("gogoanime", "en"),
    sourceCodeUrl: gogoanimeSourceCodeUrl,
    version: gogoanimeVersion,
    isManga: false);
