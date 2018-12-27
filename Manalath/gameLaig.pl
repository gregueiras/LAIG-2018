:- ensure_loaded(includes).
:- ensure_loaded(bot).
:- ensure_loaded(game).

convert_validate_info(Board,X,Y,Color) :-
  userToCoords(Board, Letter, Number, X, Y),
  validate_info(Board,X,Y,Color).

convert_validate_info(Board,X,Y,Color) :-
  printInvalidInformation,
  read_validate_info(Board,X,Y,Color).

getInformation(Board,_Lvl, X,Y,Color) :-
  getCurrentPlayerBot(0),
  convert_validate_info(Board,X,Y,Color).

getInformation(Board,Lvl, X,Y,Color) :-
  getCurrentPlayerBot(1),
  choose_move(Board, Lvl, X, Y, Color).

play_game_loop(Board,_Lvl, 1, _) :-
  display_game_winner(Board, 1), !.

play_game_loop(Board,_Lvl, 2, _) :-
  display_game_winner(Board, 2), !.

play_game_loop(Board,_Lvl, -1, _) :-
  display_game_winner(Board, -1), !.

play_game_loop(Board,Lvl,Winner, _, _, _) :-
  play_game_loop(Board,Lvl,Winner, _).

play_game_loop(Board,Lvl,Winner, _) :-
  countValidMoves(Board, 0),
  switchCurrentPlayer,
  printIsImpossiblePlay.

%BOT play
play_game_loop(Board,Lvl,NewWinner, NewBoard) :-
  getCurrentPlayer(Player), !,
  getInformation(Board,Lvl, X,Y,Color),
  play(Board,X,Y,Color,NewBoard,NewWinner).

%Player play
play_game_loop(Board, Lvl, X, Y, Color, NewWinner, NewBoard) :-
  getCurrentPlayer(Player), !,
  play(Board,X,Y,Color,NewBoard,NewWinner).


start_game_PvP(Lvl) :-
  initial_board(Board),
  assertPlayers_PvP. %initializes the players
  
start_game_PvC(Lvl) :-
  initial_board(Board),
  assertPlayers_PvC. %initializes the players
  
start_game_CvP(Lvl) :-
  initial_board(Board),
  assertPlayers_CvP. %initializes the players

start_game_CvC(Lvl) :-
  initial_board(Board),
  assertPlayers_CvC. %initializes the players

  

