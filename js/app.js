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
        const modalHeader = document.querySelector(".modal-header")
        limpiarHTML(modalHeader)
        const modalTitle = document.createElement("h1")
        modalTitle.classList.add("modal-title", "fs-3", "font-bold")
        modalTitle.id = "staticBackdropLabel"
        modalHeader.appendChild(modalTitle)
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
        const isFavorito = existeFavorito(idMeal)
        const iconClass = isFavorito ? "bi-heart-fill" : "bi-heart"
        btnFavorito.classList.add("btn", isFavorito ? "btn-warning" : "btn-danger")
        btnFavorito.innerHTML = `<i class="bi ${iconClass}"></i>`
        modalHeader.appendChild(btnFavorito)
        
        btnFavorito.onclick = () => {
            if(existeFavorito(idMeal)){
                eliminarFavorito(idMeal)
                btnFavorito.innerHTML = `<i class="bi bi-heart"></i>`
                btnFavorito.classList.remove("btn-warning")
                btnFavorito.classList.add("btn-danger")
                return
            }
            agregarFavorito({
                id: idMeal, 
                name: strMeal,
                img: strMealThumb
            })
            btnFavorito.innerHTML = `<i class="bi bi-heart-fill"></i>`
            btnFavorito.classList.add("btn-warning")
            btnFavorito.classList.remove("btn-danger")
        }

        const btnAgregarAMenu = document.createElement("button")
        btnAgregarAMenu.classList.add("btn", "col", "btn-danger")
        btnAgregarAMenu.textContent = "Añadir a Menú"
        btnAgregarAMenu.onclick = () => {
            limpiarHTML(modalBody)
            btnAgregarAMenu.textContent = "Añadir"
            const formMenu = document.createElement("form")
            const tituloDia = document.createElement("h5")
            tituloDia.textContent = "Día de la Semana"
            tituloDia.classList.add("modal-title", "fs-3", "font-bold")
            formMenu.appendChild(tituloDia)
            formMenu.appendChild(document.createElement("hr"))

            formMenu.classList.add("form-check", "form-check-inline", "w-100")
            const opcionesDia = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
            opcionesDia.forEach((opcion) => {
                const inputRadio = document.createElement("input")
                inputRadio.classList.add("form-check-input")
                inputRadio.type = "radio"
                inputRadio.name = "opcionDia"
                inputRadio.value = opcion
                const labelRadio = document.createElement("label")
                labelRadio.classList.add("form-check-label")
                labelRadio.textContent = opcion

                // Añadir el input y el label al formulario
                formMenu.appendChild(inputRadio)
                formMenu.appendChild(labelRadio)
                formMenu.appendChild(document.createElement("br"))
            })

            const tituloHorario = document.createElement("h5")
            tituloHorario.textContent = "Hora del día"
            tituloHorario.classList.add("modal-title", "fs-3", "font-bold", "p-1")
            formMenu.appendChild(tituloHorario)
            formMenu.appendChild(document.createElement("hr"))

            const opcionesHorario = ["Desayuno", "Almuerzo", "Cena"]
            opcionesHorario.forEach((opcion) => {
                const inputRadio = document.createElement("input")
                inputRadio.classList.add("form-check-input")
                inputRadio.type = "radio"
                inputRadio.name = "opcion"
                inputRadio.value = opcion
                const labelRadio = document.createElement("label")
                labelRadio.classList.add("form-check-label")
                labelRadio.textContent = opcion

                // Añadir el input y el label al formulario
                formMenu.appendChild(inputRadio)
                formMenu.appendChild(labelRadio)
                formMenu.appendChild(document.createElement("br"))
            })
            modalBody.appendChild(formMenu)
            btnAgregarAMenu.addEventListener("click", () => {
                const opcionDiaSeleccionada = formMenu.querySelector('input[name="opcionDia"]:checked')
                const opcionHorarioSeleccionada = formMenu.querySelector('input[name="opcion"]:checked')
                console.log(opcionDiaSeleccionada)
                console.log(opcionHorarioSeleccionada)
                if(opcionDiaSeleccionada && opcionHorarioSeleccionada) {
                    btnAgregarAMenu.classList.remove("btn-danger")
                    btnAgregarAMenu.classList.add("btn-success")
                    btnAgregarAMenu.textContent = '¡Añadido!'
                    mostrarToast("La receta se ha añadido correctamente al menú semanal.")
                } else {
                    btnAgregarAMenu.classList.remove("btn-success")
                    btnAgregarAMenu.classList.add("btn-danger")
                    btnAgregarAMenu.textContent = 'Añadir'
                    mostrarToast("No se ha podido añadir la receta al menú semanal. Por favor, rellene todos los campos.")
                }
            })
        }
        modalFooter.appendChild(btnAgregarAMenu)

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

