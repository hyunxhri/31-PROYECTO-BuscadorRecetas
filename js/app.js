// API -> www.themealdb.com/api/json/v1/1/categories.php
// BUSCADOR POR CATEGORIA -> www.themealdb.com/api/json/v1/1/filter.php?c=Seafood
// INFORMACION RECETA -> www.themealdb.com/api/json/v1/1/lookup.php?i=52772

const iniciarApp = () => {

    const obtenerCategorias = () => {
        url = "https://www.themealdb.com/api/json/v1/1/categories.php"
        fetch(url)
            .then((respuesta) => respuesta.json())
            .then((datos) => mostrarCategorias(datos.categories))
    } 

    // OBTIENE LAS RECETAS DE UNA CATEGORIA
    const obtenerRecetas = (e) => {
        const categoria = e.target.value
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then((respuesta) => respuesta.json())
            .then((datos) => mostrarRecetas(datos.meals)) 
    }

    const selectCategorias = document.querySelector("#categorias")
    if(selectCategorias){
        selectCategorias.addEventListener("change", obtenerRecetas)
        obtenerCategorias()
    }

    // SELECTORES
    const resultado = document.querySelector("#resultado")

    // INSTANCIAMOS EL MODAL
    const modal = new bootstrap.Modal("#modal", {})

    // LIMPIA HTML

    const limpiarHTML = (selector) => {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }

    // MUESTRA CATEGORIAS
    const mostrarCategorias = (categorias) => {
        //console.log(categorias)
        categorias.forEach(categoria => {
            const option = document.createElement("option")
            option.value = categoria.strCategory
            option.textContent = categoria.strCategory
            selectCategorias.appendChild(option)
        })
    }

    // MUESTRA TOAST (MENSAJE EMERGENTE)
    const mostrarToast = (mensaje) => {
        const toastDiv = document.querySelector("#toast")
        const toastDivBody = document.querySelector(".toast-body")
        const toast = new bootstrap.Toast(toastDiv)
        toastDivBody.textContent = mensaje
        toast.show()
    }

    // COMPRUEBA SI EXISTE FAVORITO
    const existeFavorito = (id) => {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? [] // Si es null devuelve lista vacia
        // si alguno de los favoritos id coincide con id entonces es true
        return favoritos.some((favorito) => favorito.id === id)
    }

    // ELIMINA UN FAVORITO

    const eliminarFavorito = (id) => {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? [] // Si es null devuelve lista vacia
        const nuevosFavoritos = favoritos.filter((favorito) => favorito.id !== id)
        localStorage.setItem("recetasFavoritos", JSON.stringify(nuevosFavoritos))
        mostrarToast(`Se ha eliminado de favoritos la receta.`)
        if(favoritosDiv){
            mostrarRecetas(nuevosFavoritos)
        }
    }

    const agregarFavorito = (receta) => {
        // operador nullish coalescing
        const favorito = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? [] // Si es null devuelve lista vacia
        localStorage.setItem("recetasFavoritos", JSON.stringify([...favorito, receta]))
        mostrarToast(`Se ha añadido a favoritos la receta ${receta.name}`)
    }

    // MUESTRA RECETA MODAL
    const mostrarRecetaModal = (receta) => {
        console.log(receta)
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta
        const modalTitle = document.querySelector(".modal .modal-title")
        const modalBody = document.querySelector(".modal .modal-body")
        modalTitle.textContent = strMeal
        modalBody.innerHTML = `
            <img class="img-fluid" src=${strMealThumb} alt=${strMeal}>
            <h3 class="my-3">Instrucciones</h3>
            <hr>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes</h3>
            <hr>
        `
        const listGroup = document.createElement("ul")
        listGroup.classList.add("list-group")
        for(let i = 1; i<=20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]
                const ingredientLi = document.createElement("li")
                ingredientLi.classList.add("list-group-item")
                ingredientLi.textContent = `${cantidad} - ${ingrediente}`
                listGroup.appendChild(ingredientLi)
            }
        }
        modalBody.appendChild(listGroup)

        // Mostramos los botones 
        const modalFooter = document.querySelector(".modal-footer")
        // Limpiamos footer para que no se dupliquen los botones
        limpiarHTML(modalFooter)
        // Btn favorito
        const btnFavorito = document.createElement("button")
        existeFavorito(idMeal) 
            ? btnFavorito.classList.add("btn", "btn-warning", "col")
            : btnFavorito.classList.add("btn", "btn-danger", "col")
        btnFavorito.textContent = existeFavorito(idMeal)
            ? "Eliminar favorito"
            : "Guardar favorito"
        btnFavorito.onclick = () => {
            if(existeFavorito(idMeal)){
                eliminarFavorito(idMeal)
                btnFavorito.textContent = "Guardar favorito"
                btnFavorito.classList.remove("btn-warning")
                btnFavorito.classList.add("btn-danger")
                return
            }
            agregarFavorito({
                id: idMeal, 
                name: strMeal,
                img: strMealThumb
            })
            btnFavorito.textContent = "Borrar favorito"
            btnFavorito.classList.add("btn-warning")
            btnFavorito.classList.remove("btn-danger")
        }

        modalFooter.appendChild(btnFavorito)

        // Btn cerrar
        const btnCerrar = document.createElement("button")
        btnCerrar.classList.add("btn", "btn-secondary", "col")
        btnCerrar.textContent = "Cerrar receta"
        // Funcionalidad del botón cerrar
        btnCerrar.onclick = () => {
            modal.hide()
        }
        modalFooter.appendChild(btnCerrar)

        modal.show()
    }    

    // SELECCIONAR RECETA

    const seleccionarReceta = (id) => {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then((respuesta) => respuesta.json())
            .then((datos) => mostrarRecetaModal(datos.meals[0]))   
    }

    // MUESTRA LAS RECETAS

    const mostrarRecetas = (recetas = []) => { // Ponemos por defecto una lista vacía por si acaso hay una categoría sin recetas.
        limpiarHTML(resultado)
        
        recetas.forEach(receta => {
            const contenedorRecetas = document.createElement("div")
            contenedorRecetas.classList.add("col-md-4")
            const {idMeal, strMeal, strMealThumb} = receta

            // Card de recetas
            const recetaCard = document.createElement("div")
            recetaCard.classList.add("card", "mb-4")

            // Creamos la imagen
            const recetaImagen = document.createElement("img")
            recetaImagen.classList.add("card-img-top")
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.img}`
            recetaImagen.src= strMealThumb ?? receta.img

            // Body del card
            const recetaCardBody = document.createElement("div")
            recetaCardBody.classList.add("card-body")

            // Titulo
            const recetaHeading = document.createElement("h3")
            recetaHeading.classList.add("card-title", "mb-3")
            recetaHeading.textContent = strMeal ?? receta.name

            // Boton
            const recetaButton = document.createElement("button")
            recetaButton.classList.add("btn", "btn-danger", "w-100")
            recetaButton.textContent = "Ver receta"
            recetaButton.onclick = () => {
                seleccionarReceta(idMeal ?? receta.id)
            }


            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)
            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)
            contenedorRecetas.appendChild(recetaCard)
            resultado.appendChild(contenedorRecetas)
        })
    }

    const obtenerFavoritos = () => {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? [] // Si es null devuelve lista vacia
        if(favoritos.length) {
            mostrarRecetas(favoritos)
        } else {
            const noFavoritos = document.createElement("p")
            noFavoritos.textContent = "No hay favoritos."
            noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5")
            favoritosDiv.appendChild(noFavoritos)
        }
    }

    const favoritosDiv = document.querySelector(".favoritos")
    if(favoritosDiv){
        obtenerFavoritos()
    }
}

// LISTENERS
document.addEventListener("DOMContentLoaded", iniciarApp)

