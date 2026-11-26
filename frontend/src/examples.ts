import type { ExampleProgram } from "./types";

export const EXAMPLES: ExampleProgram[] = [
  {
    id: "family",
    title: "Генеалогическое древо семьи",
    category: "Базовый Prolog",
    description: "Факты о семье Голубевых и Ивановых, правила для отца, дедушки, братьев и предков",
    suggestedQueries: [
      "father(X, ilya).",
      "grandfather(X, misa).",
      "brother(X, ilya).",
      "ancestor(X, ilya)."
    ],
    code: `% Генеалогическое древо (семья Голубевых и Ивановых)
% Факты: родитель(Родитель, Ребёнок)
parent(artem, ilya).
parent(tatiana, ilya).
parent(artem, misa).
parent(tatiana, misa).
parent(lev, artem).
parent(irina, artem).
parent(vladimir, tatiana).
parent(nina, tatiana).

% Пол
male(artem).
male(ilya).
male(misa).
male(lev).
male(vladimir).
female(tatiana).
female(irina).
female(nina).

% Логические правила
father(X, Y) :- parent(X, Y), male(X).
mother(X, Y) :- parent(X, Y), female(X).

grandfather(X, Y) :- parent(X, Z), parent(Z, Y), male(X).
grandmother(X, Y) :- parent(X, Z), parent(Z, Y), female(X).

brother(X, Y) :- parent(Z, X), parent(Z, Y), male(X), X \\= Y.
sister(X, Y) :- parent(Z, X), parent(Z, Y), female(X), X \\= Y.

% Рекурсивное правило: предок
ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).
`
  },
  {
    id: "lists",
    title: "Списки и рекурсивные операции",
    category: "Списки",
    description: "Классические операции со списками: принадлежность, конкатенация, реверс и подсчет длины",
    suggestedQueries: [
      "my_member(X, [1, 2, 3, 4, 5]).",
      "my_append([a, b], [c, d], R).",
      "my_reverse([1, 2, 3, 4], R).",
      "my_length([apple, banana, cherry], N)."
    ],
    code: `% Операции со списками на Prolog

% 1. Принадлежность элемента списку
my_member(X, [X|_]).
my_member(X, [_|Tail]) :- my_member(X, Tail).

% 2. Слияние двух списков (конкатенация)
my_append([], L, L).
my_append([Head|Tail], L2, [Head|Result]) :-
    my_append(Tail, L2, Result).

% 3. Реверс списка
my_reverse([], []).
my_reverse([Head|Tail], Reversed) :-
    my_reverse(Tail, RevTail),
    my_append(RevTail, [Head], Reversed).

% 4. Длина списка
my_length([], 0).
my_length([_|Tail], Length) :-
    my_length(Tail, SubLength),
    Length is SubLength + 1.
`
  },
  {
    id: "graph",
    title: "Поиск путей в графе (Города)",
    category: "Графы и пути",
    description: "Поиск маршрута между городами с подсчётом расстояния и предотвращением циклов",
    suggestedQueries: [
      "path(moscow, ufa, [moscow], Route, Dist).",
      "connected(spb, City).",
      "path(moscow, samara, [moscow], Route, Dist)."
    ],
    code: `% Дороги между городами: road(Город1, Город2, Расстояние_км)
road(moscow, spb, 700).
road(spb, petrozavodsk, 400).
road(moscow, kazan, 800).
road(kazan, ufa, 500).
road(kazan, samara, 360).
road(samara, ufa, 460).

% Симметричные дороги
connected(X, Y, D) :- road(X, Y, D).
connected(X, Y, D) :- road(Y, X, D).
connected(X, Y) :- connected(X, Y, _).

% Поиск пути без циклов: path(Старт, Финиш, Посещенные, Маршрут, Общий_путь)
path(A, B, _, [A, B], Dist) :-
    connected(A, B, Dist).

path(A, B, Visited, [A|Path], TotalDist) :-
    connected(A, C, D1),
    C \\= B,
    \\+ member(C, Visited),
    path(C, B, [C|Visited], Path, D2),
    TotalDist is D1 + D2.
`
  },
  {
    id: "hanoi",
    title: "Ханойские башни",
    category: "Классические алгоритмы",
    description: "Рекурсивное решение головоломки о перекладывании дисков",
    suggestedQueries: [
      "hanoi(3, 'левый', 'правый', 'средний', Moves)."
    ],
    code: `% Ханойские башни
% hanoi(Количество_дисков, Откуда, Куда, Буфер, Список_ходов)

hanoi(1, From, To, _, [move(From, To)]).

hanoi(N, From, To, Aux, Moves) :-
    N > 1,
    N1 is N - 1,
    hanoi(N1, From, Aux, To, Step1),
    hanoi(N1, Aux, To, From, Step2),
    append(Step1, [move(From, To)|Step2], Moves).
`
  },
  {
    id: "einstein",
    title: "Логическая загадка (Дома и питомцы)",
    category: "Логические головоломки",
    description: "Упрощенная загадка Эйнштейна о цветах домов, национальностях и животных",
    suggestedQueries: [
      "solve(Street, Owner)."
    ],
    code: `% Логическая загадка: кто владеет зеброй?
% Каждый дом: house(Цвет, Национальность, Животное)

solve(Houses, ZebraOwner) :-
    Houses = [
        house(red, _, _),
        house(green, _, _),
        house(blue, _, _)
    ],
    member(house(red, english, _), Houses),
    member(house(_, spanish, dog), Houses),
    member(house(_, ZebraOwner, zebra), Houses),
    member(house(green, _, cat), Houses).
`
  }
];
