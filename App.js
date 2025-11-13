import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  getAllExerciseConfigs,
  getLastWorkoutSnapshot,
  listSessions,
  saveExerciseConfig,
  saveLastWorkoutSnapshot,
  saveSession,
} from './src/services/workoutStorage';

const RAW_WORKOUTS = [
  {
    id: 'treino-1',
    name: 'Treino 1 – Peito, Ombros, Tríceps, Pernas e Abdômen',
    focus: 'Foco: empurrar (push) + pernas + abdômen',
    exercises: [
      { id: 'supino-reto', name: 'Supino Reto', sets: 3, defaultReps: 10 },
      { id: 'supino-inclinado', name: 'Supino Inclinado', sets: 3, defaultReps: 10 },
      { id: 'desenvolvimento-frontal', name: 'Desenvolvimento Frontal', sets: 3, defaultReps: 10 },
      { id: 'desenvolvimento-atras', name: 'Desenvolvimento Atrás', sets: 3, defaultReps: 10 },
      { id: 'rosca-triceps', name: 'Rosca Tríceps', sets: 3, defaultReps: 10 },
      { id: 'rosca-triceps-inversa', name: 'Rosca Tríceps Inversa', sets: 3, defaultReps: 10 },
      { id: 'triceps-frances', name: 'Tríceps Francês', sets: 3, defaultReps: 10 },
      { id: 'extensao', name: 'Extensão', sets: 3, defaultReps: 10 },
      { id: 'agachamento', name: 'Agachamento', sets: 3, defaultReps: 10 },
      { id: 'elevacao-lateral', name: 'Elevação Lateral', sets: 3, defaultReps: 12 },
      { id: 'elevacao-frontal', name: 'Elevação Frontal', sets: 3, defaultReps: 12 },
      { id: 'voador-frente', name: 'Voador Frente', sets: 3, defaultReps: 10 },
      { id: 'abdominal-bicicleta', name: 'Abdominal Bicicleta', sets: 3, defaultReps: 10 },
      {
        id: 'esteira',
        name: 'Esteira (20–30 min ritmo moderado)',
        sets: 1,
        defaultReps: 1,
        weightLabel: 'Tempo (min)',
        weightPlaceholder: 'min',
      },
    ],
  },
  {
    id: 'treino-2',
    name: 'Treino 2 – Costas, Bíceps, Posteriores, Trapézio e Abdômen',
    focus: 'Foco: puxar (pull) + posterior + definição',
    exercises: [
      { id: 'remada-curvada', name: 'Remada Curvada', sets: 3, defaultReps: 10 },
      { id: 'puxador-atras', name: 'Puxador Atrás', sets: 3, defaultReps: 10 },
      { id: 'puxador-frontal', name: 'Puxador Frontal', sets: 3, defaultReps: 10 },
      { id: 'remada-alta', name: 'Remada Alta', sets: 3, defaultReps: 10 },
      { id: 'voador-costas', name: 'Voador Costas', sets: 3, defaultReps: 10 },
      { id: 'rosca-scott', name: 'Rosca Scott', sets: 3, defaultReps: 10 },
      { id: 'rosca-concentrada', name: 'Rosca Concentrada', sets: 3, defaultReps: 10 },
      { id: 'rosca-direta-alteres', name: 'Rosca Direta com Alteres', sets: 3, defaultReps: 10 },
      { id: 'rosca-alternada-giro', name: 'Rosca Alternada com Giro', sets: 3, defaultReps: 10 },
      { id: 'flexao-posterior', name: 'Flexão (mesa flexora ou similar)', sets: 3, defaultReps: 10 },
      { id: 'abdominal-remador', name: 'Abdominal Remador', sets: 3, defaultReps: 10 },
      {
        id: 'prancha',
        name: 'Prancha',
        sets: 3,
        defaultReps: 1,
        weightLabel: 'Tempo (s)',
        weightPlaceholder: 'seg',
      },
      {
        id: 'esteira-2',
        name: 'Esteira (20–30 min ritmo moderado)',
        sets: 1,
        defaultReps: 1,
        weightLabel: 'Tempo (min)',
        weightPlaceholder: 'min',
      },
    ],
  },
];

const DEFAULT_WEIGHT = '';
const REST_TIME_SECONDS = 90;
const CALORIES_PER_MINUTE = 8;
const USER_ID = 'default-user';

const validateNumericInput = (value) => {
  if (!value || value.trim() === '') return true;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

const EXERCISE_IMAGES = {
  'supino-reto': require('./assets/fotos/supinoreto.jpg'),
  'supino-inclinado': require('./assets/fotos/supinoinclinado.jpg'),
  'desenvolvimento-frontal': require('./assets/fotos/desenvolvimentofrente.jpg'),
  'desenvolvimento-atras': require('./assets/fotos/desenvolvimentoatras.jpg'),
  'rosca-triceps': require('./assets/fotos/roscatriceps.jpg'),
  'rosca-triceps-inversa': require('./assets/fotos/roscatricepsinversa.jpg'),
  'triceps-frances': require('./assets/fotos/tricepsfrances.jpg'),
  extensao: require('./assets/fotos/extensao.jpg'),
  agachamento: require('./assets/fotos/agachamento.jpg'),
  'elevacao-lateral': require('./assets/fotos/elevaçaolateral.jpg'),
  'elevacao-frontal': require('./assets/fotos/elevaçaofrontal.jpg'),
  'voador-frente': require('./assets/fotos/voadorfrente.jpg'),
  'abdominal-bicicleta': require('./assets/fotos/abdominalbicicleta.jpg'),
  esteira: require('./assets/fotos/esteira.jpg'),
  'remada-curvada': require('./assets/fotos/remadacurvada.jpg'),
  'puxador-atras': require('./assets/fotos/puxadoratras.jpg'),
  'puxador-frontal': require('./assets/fotos/puxadorfrontal.jpg'),
  'remada-alta': require('./assets/fotos/remadaalta.jpg'),
  'voador-costas': require('./assets/fotos/voadorcostas.jpg'),
  'rosca-scott': require('./assets/fotos/roscascott.jpg'),
  'rosca-concentrada': require('./assets/fotos/roscaconcentrada.jpg'),
  'rosca-direta-alteres': require('./assets/fotos/roscadireta.jpg'),
  'rosca-alternada-giro': require('./assets/fotos/roscaalternada.jpg'),
  'flexao-posterior': require('./assets/fotos/flexao.jpg'),
  'abdominal-remador': require('./assets/fotos/abdominalremador.jpg'),
  prancha: require('./assets/fotos/prancha.jpg'),
  'esteira-2': require('./assets/fotos/esteira.jpg'),
};

const createSessionExercises = (workout) =>
  workout.exercises.map((exercise) => ({
    ...exercise,
    sets: Array.from({ length: exercise.sets }).map((_, index) => ({
      id: index,
      reps: String(exercise.defaultReps ?? 10),
      weight: DEFAULT_WEIGHT,
      completed: false,
    })),
  }));

const applyConfigsToExercises = (exercises, configs) =>
  exercises.map((exercise) => {
    const config = configs?.[exercise.id];
    if (!config?.sets?.length) {
      return exercise;
    }

    const updatedSets = exercise.sets.map((set, index) => {
      const savedSet = config.sets[index];
      return {
        ...set,
        reps: savedSet?.reps ?? set.reps,
        weight: savedSet?.weight ?? set.weight,
      };
    });

    return { ...exercise, sets: updatedSets };
  });

const applyPreviousSession = (exercises, lastSession) => {
  if (!lastSession?.exercises?.length) {
    return exercises;
  }

  return exercises.map((exercise) => {
    const lastExercise = lastSession.exercises.find((item) => item.id === exercise.id);
    if (!lastExercise?.sets?.length) {
      return exercise;
    }

    const updatedSets = exercise.sets.map((set, index) => {
      const lastSet = lastExercise.sets[index];
      if (!lastSet) {
        return set;
      }
      return {
        ...set,
        reps: lastSet.reps ?? set.reps,
        weight: lastSet.weight ?? set.weight,
      };
    });

    return { ...exercise, sets: updatedSets };
  });
};

const formatSeconds = (value) => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function App() {
  const workouts = useMemo(() => RAW_WORKOUTS, []);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [restTimer, setRestTimer] = useState(null);
  const [trainingTimer, setTrainingTimer] = useState({ running: false, elapsed: 0 });
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [photoModal, setPhotoModal] = useState({ visible: false, exercise: null });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('workouts');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingWorkout, setLoadingWorkout] = useState(false);

  useEffect(() => {
    if (!restTimer) {
      return;
    }

    if (restTimer.remaining <= 0) {
      setRestTimer(null);
      return;
    }

    const tick = setInterval(() => {
      setRestTimer((current) => {
        if (!current) {
          return null;
        }
        if (current.remaining <= 1) {
          return null;
        }
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [restTimer]);

  useEffect(() => {
    if (!trainingTimer.running) {
      return;
    }

    const tick = setInterval(() => {
      setTrainingTimer((current) => ({
        ...current,
        elapsed: current.elapsed + 1,
      }));
    }, 1000);

    return () => clearInterval(tick);
  }, [trainingTimer.running]);

  const refreshHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const sessions = await listSessions(USER_ID);
      setHistory(sessions);
    } catch (error) {
      console.warn('Erro ao carregar histórico de treinos do Firebase', error);
      // Não mostrar alerta - histórico não é crítico, apenas logar o erro
      // O app continua funcionando normalmente mesmo sem histórico
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const appendHistoryRecord = useCallback(
    async (record) => {
      try {
        const saved = await saveSession(record);
        setHistory((previous) => [saved, ...previous]);
        return saved;
      } catch (error) {
        console.warn('Erro ao registrar treino no Firebase', error);
        Alert.alert(
          'Erro',
          'Não foi possível salvar o treino. Verifique sua conexão.',
          [{ text: 'OK' }],
        );
        return null;
      }
    },
    [],
  );

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const startOfWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return start;
  }, [history]);

  const endOfWeek = useMemo(() => {
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 7);
    return end;
  }, [startOfWeek]);

  const sessionsThisWeek = useMemo(
    () =>
      history.filter((session) => {
        const sessionDate = new Date(session.completedAt);
        return sessionDate >= startOfWeek && sessionDate < endOfWeek;
      }),
    [history, startOfWeek, endOfWeek],
  );

  const weeklyPresence = useMemo(
    () =>
      weekDayLabels.map((label, index) => {
        const trained = sessionsThisWeek.some(
          (session) => new Date(session.completedAt).getDay() === index,
        );
        return { label, trained };
      }),
    [sessionsThisWeek, weekDayLabels],
  );

  const totalSetsHistory = useMemo(
    () => history.reduce((total, session) => total + (session.totalCompletedSets ?? 0), 0),
    [history],
  );

  const totalDurationHistory = useMemo(
    () => history.reduce((total, session) => total + (session.durationSeconds ?? 0), 0),
    [history],
  );

  const totalCaloriesHistory = useMemo(
    () => history.reduce((total, session) => total + (session.caloriesBurned ?? 0), 0),
    [history],
  );

  const formatSessionDate = (isoString) => {
    const date = new Date(isoString);
    const dayPart = date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
    const timePart = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dayPart} às ${timePart}`;
  };

  const handleSelectWorkout = async (workout) => {
    setSelectedWorkout(workout);
    const baseSession = createSessionExercises(workout);
    setSessionExercises(baseSession);
    setIsTraining(false);
    setRestTimer(null);
    setTrainingTimer({ running: false, elapsed: 0 });
    setWorkoutSummary(null);
    setActiveTab('workouts');
    setLoadingWorkout(true);

    try {
      const [configs, lastSession] = await Promise.all([
        getAllExerciseConfigs(USER_ID),
        getLastWorkoutSnapshot(USER_ID, workout.id),
      ]);

      setSessionExercises((current) => {
        let updated = applyPreviousSession(current, lastSession);
        updated = applyConfigsToExercises(updated, configs);
        return updated;
      });
    } catch (error) {
      console.warn('Erro ao carregar dados salvos de exercícios', error);
      Alert.alert(
        'Aviso',
        'Não foi possível carregar os dados salvos. Os valores padrão serão usados.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoadingWorkout(false);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setRestTimer(null);
    setTrainingTimer({ running: true, elapsed: 0 });
  };

  const handleToggleSet = (exerciseId, exerciseName, setIndex) => {
    if (restTimer && restTimer.key !== `${exerciseId}-${setIndex}`) {
      return;
    }

    let toggledCompleted = false;
    const timerKey = `${exerciseId}-${setIndex}`;

    setSessionExercises((previous) =>
      previous.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const updatedSets = exercise.sets.map((set, index) => {
          if (index !== setIndex) {
            return set;
          }
          toggledCompleted = !set.completed;
          return { ...set, completed: toggledCompleted };
        });

        return { ...exercise, sets: updatedSets };
      }),
    );

    if (toggledCompleted) {
      setRestTimer({
        key: timerKey,
        exerciseName,
        remaining: REST_TIME_SECONDS,
      });
    } else if (restTimer?.key === timerKey) {
      setRestTimer(null);
    }
  };

  const handleSetFieldChange = (exerciseId, setIndex, field, value) => {
    if (!validateNumericInput(value)) {
      return;
    }

    let updatedSetsSnapshot = null;

    setSessionExercises((previous) =>
      previous.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const updatedSets = exercise.sets.map((set, index) => {
          if (index !== setIndex) {
            return set;
          }
          return { ...set, [field]: value };
        });

        updatedSetsSnapshot = updatedSets;
        return { ...exercise, sets: updatedSets };
      }),
    );

    if (updatedSetsSnapshot) {
      void saveExerciseConfig(USER_ID, exerciseId, { sets: updatedSetsSnapshot }).catch((error) => {
        console.warn('Erro ao salvar configuração', error);
      });
    }
  };

  const handleBackToWorkouts = () => {
    setIsTraining(false);
    setSelectedWorkout(null);
    setSessionExercises([]);
    setRestTimer(null);
    setTrainingTimer({ running: false, elapsed: 0 });
    setActiveTab('workouts');
  };

  const confirmEndSession = () => {
    Alert.alert(
      'Encerrar treino',
      'Tem certeza que deseja encerrar o treino? O progresso será salvo.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: handleEndSession,
        },
      ],
    );
  };

  const handleEndSession = () => {
    const durationSeconds = trainingTimer.elapsed;
    const totalCompletedSets = sessionExercises.reduce(
      (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
      0,
    );
    const caloriesBurned = Math.round((durationSeconds / 60) * CALORIES_PER_MINUTE);

    const historyRecord = {
      workoutId: selectedWorkout?.id ?? 'desconhecido',
      workoutName: selectedWorkout?.name ?? 'Treino',
      durationSeconds,
      totalCompletedSets,
      caloriesBurned,
      completedAt: new Date().toISOString(),
      userId: USER_ID,
      exercises: sessionExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })),
      })),
    };

    void appendHistoryRecord(historyRecord);
    void saveLastWorkoutSnapshot(USER_ID, selectedWorkout?.id ?? 'desconhecido', {
      workoutId: selectedWorkout?.id ?? 'desconhecido',
      workoutName: selectedWorkout?.name ?? 'Treino',
      exercises: sessionExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })),
      })),
      updatedAt: new Date().toISOString(),
    }).catch((error) => {
      console.warn('Erro ao salvar snapshot do treino', error);
    });

    setWorkoutSummary({
      workoutName: selectedWorkout?.name,
      durationSeconds,
      totalCompletedSets,
      caloriesBurned,
    });

    setTrainingTimer({ running: false, elapsed: 0 });
    setIsTraining(false);
    setSelectedWorkout(null);
    setSessionExercises([]);
    setRestTimer(null);
  };

  const handleCloseSummary = () => {
    setWorkoutSummary(null);
  };

  const handleViewPerformance = () => {
    setWorkoutSummary(null);
    setActiveTab('performance');
  };

  const handleOpenPhoto = (exercise) => {
    if (!EXERCISE_IMAGES[exercise.id]) {
      return;
    }
    setPhotoModal({ visible: true, exercise });
  };

  const handleClosePhoto = () => {
    setPhotoModal({ visible: false, exercise: null });
  };

  const renderWorkoutCard = ({ item }) => (
    <TouchableOpacity style={styles.workoutCard} onPress={() => handleSelectWorkout(item)}>
      <Text style={styles.workoutTitle}>{item.name}</Text>
      <Text style={styles.workoutFocus}>{item.focus}</Text>
      <Text style={styles.workoutExercises}>{item.exercises.length} exercícios</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.container}>
        {!selectedWorkout && (
          <>
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'workouts' && styles.tabButtonActive]}
                onPress={() => setActiveTab('workouts')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'workouts' && styles.tabButtonTextActive,
                  ]}
                >
                  Treinos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'performance' && styles.tabButtonActive]}
                onPress={() => setActiveTab('performance')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'performance' && styles.tabButtonTextActive,
                  ]}
                >
                  Desempenho
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'workouts' && (
              <>
                <Text style={styles.header}>Seus Treinos</Text>
                <FlatList
                  data={workouts}
                  keyExtractor={(item) => item.id}
                  renderItem={renderWorkoutCard}
                  contentContainerStyle={styles.listContent}
                />
              </>
            )}

            {activeTab === 'performance' && (
              <ScrollView
                style={styles.performanceScroll}
                contentContainerStyle={styles.performanceContent}
              >
                <Text style={styles.header}>Desempenho</Text>
                <View style={styles.performanceSummary}>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatLabel}>Treinos concluídos</Text>
                    <Text style={styles.summaryStatValue}>{history.length}</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatLabel}>Séries completadas</Text>
                    <Text style={styles.summaryStatValue}>{totalSetsHistory}</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatLabel}>Tempo total</Text>
                    <Text style={styles.summaryStatValue}>
                      {formatSeconds(totalDurationHistory)}
                    </Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatLabel}>Calorias estimadas</Text>
                    <Text style={styles.summaryStatValue}>{totalCaloriesHistory} kcal</Text>
                  </View>
                </View>

                <View style={styles.weekSection}>
                  <Text style={styles.weekTitle}>Esta semana</Text>
                  <View style={styles.weekRow}>
                    {weeklyPresence.map((day) => (
                      <View
                        key={day.label}
                        style={[styles.weekDay, day.trained && styles.weekDayActive]}
                      >
                        <Text
                          style={[
                            styles.weekDayLabel,
                            day.trained && styles.weekDayLabelActive,
                          ]}
                        >
                          {day.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.weekInfo}>
                    {sessionsThisWeek.length > 0
                      ? `${sessionsThisWeek.length} treino(s) nesta semana`
                      : 'Ainda não há treinos registrados nesta semana'}
                  </Text>
                </View>

                <Text style={styles.historyTitle}>Últimos treinos</Text>
                {loadingHistory ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#facc15" />
                    <Text style={styles.loadingText}>Carregando histórico...</Text>
                  </View>
                ) : history.length === 0 ? (
                  <Text style={styles.emptyHistory}>
                    Nenhum treino concluído ainda. Inicie um treino para acompanhar seu desempenho.
                  </Text>
                ) : (
                  history.map((session) => (
                    <View key={session.id} style={styles.historyCard}>
                      <Text style={styles.historyWorkout}>{session.workoutName}</Text>
                      <Text style={styles.historyMeta}>{formatSessionDate(session.completedAt)}</Text>
                      <View style={styles.historyStatsRow}>
                        <View style={styles.historyStatItem}>
                          <Text style={styles.historyStatLabel}>Duração</Text>
                          <Text style={styles.historyStatValue}>
                            {formatSeconds(session.durationSeconds)}
                          </Text>
                        </View>
                        <View style={styles.historyStatItem}>
                          <Text style={styles.historyStatLabel}>Séries</Text>
                          <Text style={styles.historyStatValue}>
                            {session.totalCompletedSets}
                          </Text>
                        </View>
                        <View style={styles.historyStatItem}>
                          <Text style={styles.historyStatLabel}>Calorias</Text>
                          <Text style={styles.historyStatValue}>
                            {session.caloriesBurned} kcal
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </>
        )}

        {selectedWorkout && !isTraining && (
          <View style={styles.detailsContainer}>
            <Text style={styles.breadcrumb} onPress={handleBackToWorkouts}>
              Voltar
            </Text>
            <Text style={styles.detailTitle}>{selectedWorkout.name}</Text>
            <Text style={styles.detailFocus}>{selectedWorkout.focus}</Text>
            <Text style={styles.detailSubtitle}>Exercícios</Text>
            {loadingWorkout ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#facc15" />
                <Text style={styles.loadingText}>Carregando dados...</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.detailExercises}>
                  {sessionExercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exercisePreview}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseInfo}>{exercise.sets.length} séries</Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.primaryButton} onPress={handleStartTraining}>
                  <Text style={styles.primaryButtonText}>Iniciar treino</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {selectedWorkout && isTraining && (
          <View style={styles.sessionContainer}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>{selectedWorkout.name}</Text>
            </View>
            <Text style={styles.sessionFocus}>{selectedWorkout.focus}</Text>
            <View style={styles.timerRow}>
              <Text style={styles.timerRowLabel}>Tempo de treino</Text>
              <Text style={styles.timerRowValue}>{formatSeconds(trainingTimer.elapsed)}</Text>
            </View>
            <ScrollView style={styles.sessionScroll}>
              {sessionExercises.map((exercise) => (
                <View key={exercise.id} style={styles.sessionExercise}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.sessionExerciseName}>{exercise.name}</Text>
                    {EXERCISE_IMAGES[exercise.id] ? (
                      <TouchableOpacity
                        style={styles.photoButton}
                        onPress={() => handleOpenPhoto(exercise)}
                      >
                        <Text style={styles.photoButtonText}>Foto</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {exercise.sets.map((set, index) => {
                    const key = `${exercise.id}-${index}`;
                    const weightLabel = exercise.weightLabel ?? 'Peso';
                    const weightPlaceholder = exercise.weightPlaceholder ?? 'kg';
                    return (
                      <View key={key} style={styles.setRow}>
                        <TouchableOpacity
                          style={[
                            styles.setIndicator,
                            set.completed && styles.setIndicatorCompleted,
                            restTimer && restTimer.key !== key ? styles.setIndicatorDisabled : null,
                          ]}
                          onPress={() => handleToggleSet(exercise.id, exercise.name, index)}
                          disabled={!!restTimer && restTimer.key !== key}
                        >
                          <Text style={styles.setIndicatorText}>{index + 1}</Text>
                        </TouchableOpacity>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Reps</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={set.reps}
                            onChangeText={(text) =>
                              handleSetFieldChange(exercise.id, index, 'reps', text)
                            }
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>{weightLabel}</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder={weightPlaceholder}
                            value={set.weight}
                            onChangeText={(text) =>
                              handleSetFieldChange(exercise.id, index, 'weight', text)
                            }
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.dangerButton} onPress={confirmEndSession}>
              <Text style={styles.dangerButtonText}>Encerrar treino</Text>
            </TouchableOpacity>
          </View>
        )}

        {restTimer && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerTitle}>Descanso</Text>
            <Text style={styles.timerExercise}>{restTimer.exerciseName}</Text>
            <Text style={styles.timerValue}>{formatSeconds(restTimer.remaining)}</Text>
          </View>
        )}

        {workoutSummary && (
          <View style={styles.summaryOverlay}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Treino finalizado</Text>
              {workoutSummary.workoutName ? (
                <Text style={styles.summaryWorkout}>{workoutSummary.workoutName}</Text>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duração</Text>
                <Text style={styles.summaryValue}>
                  {formatSeconds(workoutSummary.durationSeconds)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Séries concluídas</Text>
                <Text style={styles.summaryValue}>{workoutSummary.totalCompletedSets}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Calorias estimadas</Text>
                <Text style={styles.summaryValue}>{workoutSummary.caloriesBurned} kcal</Text>
              </View>
              <TouchableOpacity style={styles.summaryButton} onPress={handleCloseSummary}>
                <Text style={styles.summaryButtonText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.summarySecondaryButton}
                onPress={handleViewPerformance}
              >
                <Text style={styles.summarySecondaryButtonText}>Ver desempenho</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal visible={photoModal.visible} transparent animationType="fade" onRequestClose={handleClosePhoto}>
          <View style={styles.photoOverlay}>
            <View style={styles.photoCard}>
              <Image
                source={
                  photoModal.exercise ? EXERCISE_IMAGES[photoModal.exercise.id] : undefined
                }
                style={styles.exerciseImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.photoCloseButton} onPress={handleClosePhoto}>
                <Text style={styles.photoCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#cbd5f5',
    marginTop: 12,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 999,
    padding: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#facc15',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  performanceScroll: {
    flex: 1,
  },
  performanceContent: {
    paddingBottom: 32,
  },
  performanceSummary: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryStat: {
    marginBottom: 12,
  },
  summaryStatLabel: {
    color: '#cbd5f5',
    fontSize: 13,
    marginBottom: 4,
  },
  summaryStatValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  weekSection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  weekTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    alignItems: 'center',
  },
  weekDayActive: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  weekDayLabel: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  weekDayLabelActive: {
    color: '#0f172a',
  },
  weekInfo: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  historyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyWorkout: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  historyMeta: {
    color: '#cbd5f5',
    fontSize: 13,
    marginBottom: 12,
  },
  historyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStatItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  historyStatLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  historyStatValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyHistory: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  workoutCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  workoutFocus: {
    fontSize: 14,
    color: '#cbd5f5',
    marginBottom: 12,
  },
  workoutExercises: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  detailsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  breadcrumb: {
    color: '#38bdf8',
    marginBottom: 12,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  detailFocus: {
    fontSize: 14,
    color: '#cbd5f5',
    marginBottom: 16,
  },
  detailSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  detailExercises: {
    flex: 1,
  },
  exercisePreview: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseName: {
    color: '#f8fafc',
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseInfo: {
    color: '#94a3b8',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#facc15',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 16,
  },
  sessionContainer: {
    flex: 1,
    paddingTop: 16,
  },
  sessionHeader: {
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    paddingRight: 16,
  },
  sessionFocus: {
    fontSize: 14,
    color: '#cbd5f5',
    marginTop: 8,
    marginBottom: 16,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timerRowLabel: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '600',
  },
  timerRowValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  sessionScroll: {
    flex: 1,
  },
  sessionExercise: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionExerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  photoButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  photoButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  setIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setIndicatorCompleted: {
    backgroundColor: '#38bdf8',
  },
  setIndicatorDisabled: {
    opacity: 0.4,
  },
  setIndicatorText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  inputGroup: {
    flexDirection: 'column',
    marginRight: 12,
  },
  inputLabel: {
    color: '#cbd5f5',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dangerButton: {
    marginTop: 8,
    backgroundColor: '#f87171',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 16,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#facc15',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  timerExercise: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  summaryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  summaryTitle: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryWorkout: {
    color: '#f8fafc',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  summaryValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryButton: {
    marginTop: 16,
    backgroundColor: '#facc15',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  summaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  summarySecondaryButton: {
    marginTop: 12,
    backgroundColor: '#38bdf8',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  summarySecondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  photoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  photoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  exerciseImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
  },
  photoCloseButton: {
    marginTop: 16,
    backgroundColor: '#facc15',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  photoCloseButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
});
