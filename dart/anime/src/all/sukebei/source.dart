import '../../../../../model/source.dart';

const _sukebeiVersion = "0.0.1";
const _sukebeiSourceCodeUrl =
    "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/$branchName/dart/anime/src/all/sukebei/sukebei.dart";

String _iconUrl =
    "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/$branchName/dart/anime/src/all/sukebei/icon.png";

Source get sukebeiSource => _sukebeiSource;
Source _sukebeiSource = Source(
    name: 'Sukebei',
    baseUrl: "https://sukebei.nyaa.si",
    lang: "all",
    typeSource: "torrent",
    iconUrl: _iconUrl,
    version: _sukebeiVersion,
    isManga: false,
    isNsfw: true,
    sourceCodeUrl: _sukebeiSourceCodeUrl);
