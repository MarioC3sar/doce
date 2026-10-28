# Doce Flutter

Flutter/Dart client for the existing Spring Boot API. The React Native app in
`../doce-mobile` and the Java backend are retained.

Client removal is a soft delete: archived clients disappear from active client
lists, remain linked to order history, and can be restored from the Inativos
filter in the Flutter app. New orders cannot be assigned to an inactive client.

## API URL

`API_BASE_URL` can be supplied at build/run time with `--dart-define`.

- Android over USB: default `http://127.0.0.1:8081`; run `adb reverse tcp:8081 tcp:8081` first.
- Android emulator without reverse: use `http://10.0.2.2:8081`.
- iOS simulator: default `http://localhost:8081`.
- Physical device: use the computer's LAN address, for example
  `http://192.168.0.10:8080`.
- Production: provide the deployed HTTPS API URL.

Example for a physical Android device:

```sh
flutter run --dart-define=API_BASE_URL=http://192.168.0.10:8081
```

For an Android emulator, run `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8081`.

The Android debug manifest permits HTTP for local development. Release builds
should use HTTPS. iOS permits local network API access for development.

## Run and validate

From this directory:

```sh
flutter pub get
flutter run
dart format .
flutter analyze
flutter test
```

Requires Flutter and Dart on `PATH`; this workspace's SDK is installed at
`/home/mario/development/flutter/bin`.
