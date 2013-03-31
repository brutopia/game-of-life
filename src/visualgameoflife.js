'use strict';

function VisualGameOfLife(width, height, canvasElement, cellsize, padding){
  var that = new GameOfLife(width,height);
  //var palette = ['#3300FF','#3300CC','#330099','#330066','#330033','#330000'];
  //var palette = ['#FE4365', '#FC9D9A', '#F9CDAD','#C8C8A9','#83AF9B']
  var palette = ['#CC0C39', '#E6781E', '#C8CF02','#F8FCC1','#1693A7']
  
  var canvas;
  that.__defineGetter__("canvas", function(){return canvas});

  if(canvasElement === undefined){
    canvas = createCanvas();
  }
  else{
    canvas = canvasElement;
  }

  // Choose color to draw from palette
  function selectColor(generation){
    if((generation) > (palette.length-1)){
      return palette[palette.length-1];
    }
    else{
      return palette[generation];
    }
  }

  // Creates a new canvas element of the right dimensions for us
  function createCanvas(){
    var c =  document.createElement('canvas');
    c.width = (width * cellsize) + ((1 + width) * padding);
    c.height = (height * cellsize) + ((1 + height) * padding);
    return c;
  }

  // Draws the board onto the canvas
  that.draw = function (){
    var width=that.board.length, height=that.board[0].length;
    var context = canvas.getContext("2d");
    for(var x=0;x<width;x++){
      for(var y=0;y<height;y++){
        if(that.board[x][y].alive){
          context.fillStyle = selectColor(that.board[x][y].generation);
          context.fillRect(1+x*cellsize + x, 1+y*cellsize + y, cellsize, cellsize);
        }
      }
    }
  }

  // Load an image file to a new board
  that.loadImage = function(file){
    var tmpCanvas = document.createElement('canvas');
    var context = tmpCanvas.getContext('2d');
    var img=new Image();
    img.src=file;
    context.drawImage(img,0,0);
    var data = context.getImageData(0,0,img.width,img.height).data;

    var newBoard = [];
    for(var x=0;x<img.width;x++){
      newBoard[x] = [];
      for(var y=0;y<img.height;y++){
        var offset = (x + y*img.width)*4;
        if(data[offset] > 0 || data[offset+1] > 0 || data[offset+2] > 0 ){
          newBoard[x][y] = true;
        }
        else{
          newBoard[x][y] = false;
        }
      }
    }
    that.board = newBoard;
    width = img.width;
    height = img.height;
    canvas = createCanvas();

  }

  // Clears the canvas
  that.clear = function (){
    canvas.width = canvas.width;
  }

  // Checks if the browser supports canvas
  that.canvasSupport = function(){
    var c = document.createElement('canvas');
    return !!(c.getContext && c.getContext('2d'));
  }
   
  return that;
}

