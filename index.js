$(document).ready(function(){
	$('#formTitle').addClass('shake-rotate');
	setTimeout(function(){
		$('#formTitle').removeClass('shake-rotate')
	}, 800)
});

function main(){

	//Create API parameters based on ingredients inputed
	var inputVal = document.getElementById('ingredientsInput').value;
	var upToIngredients = 'https://api.spoonacular.com/recipes/findByIngredients?ingredients=';
	var afterIngredients = '&apiKey=625412eb4e1a400aa581d400012ee92d'

	//Get recipes for specific ingredients from API 
	var searchByIngredients = new XMLHttpRequest();
	searchByIngredients.open("GET", upToIngredients + inputVal + afterIngredients, false);
	searchByIngredients.send();

	//Parse what API returns (in JSON)
	var data = JSON.parse(searchByIngredients.response);

	var i, l, list;
    if(data && data.length > 0) {
        list = ['<ul>'];
        for(i=0,l=data.length; i<l; i++) {
              list.push('<li data-id="' + data[i].id + '">' + data[i].title + '</li>');
            }
        list.push('</ul>');
        $('#similar').html(list.join(''));
        }

	
};