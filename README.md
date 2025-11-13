# 💪 App de Treino - Academia

App mobile para controle de treinos de academia com integração Firebase.

## 🚀 Funcionalidades

- ✅ Dois treinos completos (Peito/Tríceps e Costas/Bíceps)
- ⏱️ Cronômetro de treino e descanso (90s)
- 📊 Dashboard de desempenho com estatísticas semanais
- 📸 Fotos dos exercícios
- 💾 Persistência de dados no Firestore
- 🔄 Sincronização automática de pesos e repetições
- 📈 Histórico completo de treinos

## 🛠️ Tecnologias

- React Native (Expo)
- Firebase (Firestore)
- React Hooks
- Safe Area Context

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
npm start
```

## 📱 Build APK

### Opção 1: EAS Build (Recomendado)
```bash
eas build -p android --profile preview
```

### Opção 2: GitHub Actions
O workflow `.github/workflows/build-apk.yml` gera o APK automaticamente quando você faz push.

**Configuração necessária:**
1. Crie um token no [expo.dev](https://expo.dev)
2. Adicione como secret no GitHub: `EXPO_TOKEN`

## 🔥 Firebase

Configure suas credenciais do Firebase em `src/services/firebase.js`

## 📄 Licença

Privado

