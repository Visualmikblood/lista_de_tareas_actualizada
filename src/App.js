import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tareas, setTareas] = useState(() => {
    const tareasGuardadas = localStorage.getItem('tareas');
    return tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
  });

  const [nuevaTarea, setNuevaTarea] = useState('');
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');
  const [tareaArrastrada, setTareaArrastrada] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas));
  }, [tareas]);

  const obtenerHora = () => {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  };

  const agregarTarea = () => {
    if (nuevaTarea.trim() === '') return;
    const nueva = {
      texto: nuevaTarea,
      completada: false,
      horaCreacion: obtenerHora(),
    };
    setTareas([...tareas, nueva]);
    setNuevaTarea('');
  };

  const toggleCompletada = (index) => {
    const nuevas = tareas.map((tarea, i) =>
      i === index ? { ...tarea, completada: !tarea.completada } : tarea
    );
    setTareas(nuevas);
  };

  const empezarEditar = (index) => {
    setEditandoIndex(index);
    setTextoEditado(tareas[index].texto);
  };

  const guardarEdicion = (index) => {
    const nuevas = tareas.map((tarea, i) =>
      i === index ? { ...tarea, texto: textoEditado } : tarea
    );
    setTareas(nuevas);
    setEditandoIndex(null);
    setTextoEditado('');
  };

  const eliminarTarea = (index) => {
    const nuevas = tareas.filter((_, i) => i !== index);
    setTareas(nuevas);
  };

  // Drag & Drop nativo:
  const handleDragStart = (e, index) => {
    setTareaArrastrada(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {//tengo que acordarme que chatgpt me puede ayudar a hacer que el movimiento de las tareas sea mas fluido 
    e.preventDefault();
    if (index === tareaArrastrada) return;

    const nuevas = [...tareas];
    const arrastrada = nuevas.splice(tareaArrastrada, 1)[0];
    nuevas.splice(index, 0, arrastrada);
    setTareaArrastrada(index);
    setTareas(nuevas);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setTareaArrastrada(null);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  // Filtrar tareas por búsqueda
  const tareasFiltradas = tareas.filter((tarea) =>
    tarea.texto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Lista de Tareas Mejorada</h1>

      <div className="input-area">
        <input
          type="text"
          placeholder="Escribe una tarea"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregarTarea()}
        />
        <button onClick={agregarTarea}>Agregar</button>
      </div>

      <div className="busqueda-area">
        <input
          type="text"
          placeholder="Buscar tareas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <ul className="lista-tareas">
        {tareasFiltradas.map((tarea, index) => {
          // Encontrar índice real para drag & drop
          const indiceReal = tareas.findIndex(t => t === tarea);

          return (
            <li
              key={indiceReal}
              draggable
              onDragStart={(e) => handleDragStart(e, indiceReal)}
              onDragOver={(e) => handleDragOver(e, indiceReal)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`${tarea.completada ? 'completada' : ''} ${tareaArrastrada === indiceReal ? 'arrastrando' : ''}`}
            >
              <input
                type="checkbox"
                checked={tarea.completada}
                onChange={() => toggleCompletada(indiceReal)}
              />

              {editandoIndex === indiceReal ? (
                <>
                  <input
                    type="text"
                    value={textoEditado}
                    onChange={(e) => setTextoEditado(e.target.value)}
                  />
                  <button onClick={() => guardarEdicion(indiceReal)}>Guardar</button>
                  <button onClick={() => setEditandoIndex(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <span>{tarea.texto}</span>
                  <button onClick={() => empezarEditar(indiceReal)}>Editar</button>
                  <button onClick={() => eliminarTarea(indiceReal)}>Eliminar</button>
                  <p className="hora-tarea">📅 {tarea.horaCreacion}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
