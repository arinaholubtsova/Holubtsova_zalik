import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Animated, Easing } from 'react-native';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  { question: "Який компонент у React Native використовується для виведення тексту?", options: ["View", "Text", "Label", "Span"], correct: 1 },
  { question: "Яка бібліотека є стандартом для навігації в React Native?", options: ["React Router Dom", "React Navigation", "Native History API", "Expo Router"], correct: 1 },
  { question: "Для чого використовується AsyncStorage?", options: ["Для стилізації", "Для збереження даних", "Для швидкості CPU", "Для 3D графіки"], correct: 1 },
  { question: "Як додати внутрішні відступи (в межах елемента) в стилях?", options: ["margin", "padding", "spacing", "borderWidth"], correct: 1 },
  { question: "Яка команда ініціалізує новий проект через Expo?", options: ["create-react-app", "create-expo-app", "expo start", "rn init"], correct: 1 },
  { question: "Який хук використовується для стану в компонентах?", options: ["useEffect", "useState", "useRef", "useContext"], correct: 1 },
  { question: "Чим відрізняється FlatList від ScrollView?", options: ["Нічим", "FlatList рендерить лише видиме", "ScrollView швидше", "FlatList без прокрутки"], correct: 1 },
  { question: "Яка властивість Flexbox визначає напрямок головної осі?", options: ["alignItems", "flexDirection", "justifyContent", "flexWrap"], correct: 1 },
  { question: "Як називається інструмент для перегляду логів Expo?", options: ["Expo Go / Dev Tools", "Chrome Task Manager", "VS Search", "Android Emulator"], correct: 0 },
  { question: "Який метод навігації переводить на новий екран?", options: ["goBack()", "navigate()", "pushStack()", "change()"], correct: 1 }
];

export default function QuizApp() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const timerValue = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (showScore) return;

    timerValue.setValue(1);
    animationRef.current = Animated.timing(timerValue, {
      toValue: 0,
      duration: 15000,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished && selectedOption === null) {
        handleAnswer(-1);
      }
    });

    return () => animationRef.current?.stop();
  }, [currentQuestion, showScore]);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;

    animationRef.current?.stop();
    setSelectedOption(index);

    const correct = index === QUESTIONS[currentQuestion].correct;
    if (correct) setScore(prev => prev + 1);
    else setWrongAnswers(prev => prev + 1);

    setTimeout(() => {
      const next = currentQuestion + 1;
      if (next < QUESTIONS.length) {
        setCurrentQuestion(next);
        setSelectedOption(null);
      } else {
        setShowScore(true);
      }
    }, 1200);
  };

  const reset = () => {
    setCurrentQuestion(0);
    setScore(0);
    setWrongAnswers(0);
    setShowScore(false);
    setSelectedOption(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {currentQuestion + 1} / {QUESTIONS.length}
            </Text>

            <View style={styles.statBadges}>
              <View style={[styles.badge, styles.wrongBg]}>
                <Text style={styles.badgeText}>✕ {wrongAnswers}</Text>
              </View>
              <View style={[styles.badge, styles.correctBg]}>
                <Text style={styles.badgeText}>✓ {score}</Text>
              </View>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }]} />
          </View>
        </View>

        {showScore ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Результати</Text>
            <Text style={styles.resultScore}>{score} / {QUESTIONS.length}</Text>

            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>Спробувати ще раз</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizCard}>

            <Animated.View style={[styles.timerBar, {
              width: timerValue.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: timerValue.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: ['#FF5252', '#FFD740', '#4CAF50']
              })
            }]} />

            <Text style={styles.question}>
              {QUESTIONS[currentQuestion].question}
            </Text>

            {QUESTIONS[currentQuestion].options.map((opt, i) => {
              const isCorrect = i === QUESTIONS[currentQuestion].correct;
              const isSelected = i === selectedOption;

              let extraStyle = {};
              if (selectedOption !== null) {
                if (isCorrect) extraStyle = styles.correctBorder;
                else if (isSelected) extraStyle = styles.wrongBorder;
              }

              return (
                <TouchableOpacity
                  key={i}
                  disabled={selectedOption !== null}
                  style={[styles.option, extraStyle]}
                  onPress={() => handleAnswer(i)}
                >
                  <Text style={styles.optionText}>{String.fromCharCode(65 + i)}. {opt}</Text>
                  {selectedOption !== null && isCorrect && (
                    <Text style={styles.labelOk}>Правильно</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },

  topBar: {
    marginTop: 10,
    marginBottom: 28,
    paddingHorizontal: 6,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  statBadges: {
    flexDirection: 'row',
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },

  wrongBg: { backgroundColor: '#FFEBEE' },
  correctBg: { backgroundColor: '#E8F5E9' },

  badgeText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  track: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },

  quizCard: {
    backgroundColor: '#FFF',
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },

  timerBar: {
    height: 6,
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  question: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1A1A1A',
    marginVertical: 22,
    lineHeight: 30,
  },

  option: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },

  optionText: {
    fontSize: 17,
    color: '#4A5568',
    fontWeight: '500',
  },

  correctBorder: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },

  wrongBorder: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF5252',
  },

  labelOk: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },

  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },

  resultScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 20,
  },

  resetBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 35,
    paddingVertical: 18,
    borderRadius: 20,
  },

  resetBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});