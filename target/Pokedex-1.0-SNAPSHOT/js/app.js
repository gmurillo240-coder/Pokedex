const botonBuscar = document.getElementById("btnBuscar");// asignamos la variable(botonBuscar) al boton buscar
const nombrePokemon = document.getElementById("nombrePokemon");//obtenemos el nombre del pokemon de la caja de texto
const imagenPokemon = document.getElementById("imagenPokemon");// creamos la variable para almacenar la imagen del pokemon


const id = document.getElementById("id");
const tipo = document.getElementById("tipo");
const altura = document.getElementById("altura");
const peso = document.getElementById("peso");


botonBuscar.addEventListener("click", function () {

    const pokemon = nombrePokemon.value;// la variable pokemon almancena el nombre ingresado por el usuario

    const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;//asignamos la url de la apiPokemon concatenando el nombre del pokemon escrito por el usuario a buscar



    fetch(url)// funcion para solicitar al servidor los datos al servidor api

            .then(function (respuesta) {//almacenamos los datos recibidos en la variable respuesta
                if (respuesta.ok) {
                    return respuesta.json();// solicitamos que se devuelva un valor de los datos recibidos en formato JSON
                } else {
                    throw new Error("pokemon no encontrado");
                }

            })


            .then(function (datos) {//

                console.log(datos);//mostramos los datos recibidos en consola

                imagenPokemon.src = datos.sprites.front_default;// asignamos el link de referencia para la imagen del pokemon en html 
                id.textContent = datos.id;
                tipo.textContent = datos.types[0].type.name;
                altura.textContent = datos.height;
                peso.textContent = datos.weight;
                nombrePokemon.textContent = datos.name;
            })

            .catch(function (error) {
                console.log(error);
                alert("pokemon no encontrado");

            });


});







