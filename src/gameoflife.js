'use strict';

// Circular Array type
function ToroidalArray(a){
  var that;
  if(a instanceof Array){that = a;} 
  else{that = new Array();}

  that.get = function(index){
    index = index % this.length;
    if(index < 0){
      return this[this.length+index];
    }
    else{
      return this[index];
    }
  }
  return that;
}

// Cell type
function Cell(isAlive){
  if(typeof(isAlive)==='undefined'){isAlive = true;}

  var alive = isAlive;
  this.__defineGetter__("alive", function(){return alive});
  
  var lastState = isAlive;
  this.__defineGetter__("lastState", function(){return lastState});
  
  var generation = 0; 
  this.__defineGetter__("generation", function(){return generation});

  this.color = '#fff';

  this.age = function(){generation++; lastState=alive;}
  this.kill = function(){generation=0; alive=false;}
  this.spawn = function(){generation=0; alive=true;}
};

// Our cellular automata rules (s23/b2 by default)
function Ruleset(){
  // Default to conway rules
  this.s = [2,3]; 
  this.b = [3]; 
  this.c = -1;
  
  this.parse = function(string){
    string = string.toLowerCase();
    var validationRegexp = /^([sbc]\d{1,8}\/?){2,3}$/;
    if(string.search(validationRegexp) < 0) {throw "Not a valid rule definition. Make sure you use the format sXX/bXX/cX where X is an integer";}

    this.s = []; this.b=[]; this.c=-1;
    string = string.split('/');
    for(var i=0;i<string.length;i++){
      var rule = string[i].split('');
      switch(rule[0].toLowerCase()){
        case('s'):
        this.s = rule.slice(1).map(function(x){return parseInt(x)});
        break;
        case('b'):
        this.b = rule.slice(1).map(function(x){return parseInt(x)});
        break;
        case('c'):
        this.c = parseInt(string[i].substring(1));
        break;
        default:
        throw "Unknown rule type " + rule[0];
      }
    }
  };

};

function GameOfLife(width, height){
  if(typeof(width) === 'undefined' || typeof(height) === 'undefined'){throw "You must define a width and height of the game board";}

  // Initialize
  var board = randomBoard(width, height);
  var rules = new Ruleset();
  var currentGeneration = 0;
  
  // Encapsulated properties
  this.__defineGetter__("rules", function(){return rules});
  this.__defineGetter__("currentGeneration", function(){return rules});

  // Encapsulated board
  this.__defineGetter__("board", function(){
    return board;    
  });
  this.__defineSetter__("board", function(array){
    if(!(array instanceof Array) || !(array[0] instanceof Array)){throw "Must give a two-dimensional array";}
    var newBoard = new ToroidalArray();
    for(var x=0;x<array.length;x++){
      newBoard[x] = new ToroidalArray();
      for(var y=0;y<array[0].length;y++){
        var cell = new Cell(array[x][y] > 0);
        cell.color = array[x][y];
        newBoard[x][y] = cell;
      }
    }
    board = newBoard;
  });


  // Applies the current ruleset to a cell
  function applyRules(cell, noNeighbors){
    // Max life time rules
    if(rules.c > 0 && cell.generation > rules.c){
      cell.alive = false;
    }
    
    if(cell.alive){
      // Staying alive rules
      if(rules.s.indexOf(noNeighbors)>=0){
          // Do nothing. Already alive
      }
      else{
        cell.kill();
      }
    }
    else{
      // Birth rules
      if (rules.b.indexOf(noNeighbors)>=0){
        cell.spawn();
      }

    }
  }


  // Generate a randomized board
  function randomBoard(width,height){
    var newBoard = new ToroidalArray();
    for(var x=0; x<width; x++){
      newBoard[x] = new ToroidalArray();
      for(var y=0; y<height; y++){
        var r = Math.round(Math.random());
        newBoard[x][y] = new Cell((r === 1));
      }
    }
    return newBoard;
  }

  // Public method to randomize the board
  this.randomize = function(){
    board = randomBoard(width, height);
    currentGeneration = 0;
  }

  // Public method that generates the next generation
  this.evolve = function (){
    var width = board.length;
    var height= board[0].length;
    var neighborBoard = [];
    for(var x=0; x<width; x++){
      neighborBoard[x] = []
      for(var y=0; y<height; y++){
        var neighbors = 0;
        for(var i=-1;i<=1;i++){
          for(var j=-1;j<=1;j++){
            if(board.get(x+i).get(y+j).lastState === true){
              neighbors++;
            }
          }
        }
        if(board[x][y].lastState === true){neighbors--;} // Correct for counting the current position in the loops above
        applyRules(board[x][y], neighbors);
      }
    }

    // Age cells
    currentGeneration++;
    for(var x=0; x<width; x++){
      for(var y=0; y<height; y++){
        board[x][y].age();
      }
    }
    
  }

  // For logging purposes
  this.prettyPrint = function(){
    var string = '';
    for(var x=0;x<board.length;x++){
      var line = '';
      for(var y=0;y<board[0].length;y++){
        if(board[x][y].alive){
          line += 'x';
        }
        else{
          line += '_';
        }
      }
      string += line + '\n';
    }
    return string;
  }

  return this;
}