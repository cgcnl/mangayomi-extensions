import '../../../../../../model/source.dart';

Source get franxxmangasSource => _franxxmangasSource;
Source _franxxmangasSource = Source(
    name: "Franxx Mangás",
    baseUrl: "https://franxxmangas.net",
    lang: "pt-br",
    isNsfw:true,
    typeSource: "mangareader",
    iconUrl: "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/$branchName/dart/manga/multisrc/mangareader/src/franxxmangas/icon.png",
    dateFormat:"MMMMM dd, yyyy",
    dateFormatLocale:"pt-br"
  );
