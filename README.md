# YT Core Mobile

YTWaterCore ve YTBarberCore için ortak Android (ileride iOS) uygulaması. Expo SDK 58 + React Native + TypeScript + Expo Router.
Sunuculardaki `/api/v1` sözleşmesini kullanır (bkz. sunucu projelerindeki `docs/API-V1.md`); uygulamada sabit site adresi yoktur, girişte yazılır.

## Özellikler
- Giriş (+2FA); girişte sitenin adı/simgesi/rengi önizlenir ve uygulama o temayı kullanır.
- Özet: panel kutucukları ve son bildirimler (uygulama açıkken 15 sn yoklama + yerel bildirim).
- Panel / Canlı ekran / Teslimatlar: sitenin kendi sayfaları, tek kullanımlık bilet ile (parola yeniden istenmez), yalnız site adresinde gezinir. Ekran sekmesi uyanık kalır.
- Kurye: *Ayarlar → Konumumu paylaş* — ön plan servisiyle ekran kilitliyken de konum gönderir (`POST /api/v1/location`).
- Tablet (yönetici) ve telefon (kurye) için duyarlı düzen; ekran yönü serbest.

## Geliştirme
```
npm ci --legacy-peer-deps
npm run typecheck && npm test
npx expo start           # Expo Go ile arayüz denemesi (konum görevi/bildirim tam çalışmaz)
```
`android/` klasörü repoda tutulmaz (Continuous Native Generation); CI üretir.

## APK (mağazasız kurulum)
`release` dalına push → *Android APK* iş akışı → Actions çıktısındaki `ytcore-android-apk` dosyasını indirip cihaza kurun ("bilinmeyen kaynaklara izin").
APK şimdilik debug anahtarıyla imzalanır (kendi kullanımınız için yeterli). Mağazaya çıkmadan önce kalıcı bir yükleme anahtarı üretip Actions *secrets* olarak eklenmelidir.

## Bilinen sınırlar / sıradaki adımlar
- Uygulama tamamen kapalıyken bildirim (FCM push) yok; konum paylaşımı açıkken ön plan servisi uygulamayı canlı tutar. FCM bir sonraki adım (sunucuda `desktop` kanalına benzer `mobile` kanalı).
- Gerçek cihaz ve canlı sunucuyla uçtan uca deneme yapılmamıştır; ilk kurulumda giriş, kilit ekranında konum ve panel açılışı denenmelidir.
