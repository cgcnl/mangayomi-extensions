import '../../../../../../model/source.dart';

Source get passamaoscanSource => _passamaoscanSource;
Source _passamaoscanSource = Source(
    name: "Passa Mão Scan",
    baseUrl: "https://passamaoscan.com",
    lang: "pt-br",
    isNsfw:true,
    typeSource: "madara",
    iconUrl: "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/main/dart/manga/multisrc/madara/src/passamaoscan/icon.png",
    dateFormat:"dd/MM/yyyy",
    dateFormatLocale:"pt-br"
  );
