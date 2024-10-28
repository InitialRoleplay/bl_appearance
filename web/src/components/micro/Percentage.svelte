<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Props with default values
    export let value = { x: 0.5, y: 0.5 };
    export let width = 400;
    export let height = 200;
    export let gridCellsX = 10;
    export let gridCellsY = 5;

    let container;
    let isDragging = false;

    function updatePosition(clientX, clientY) {
        if (!isDragging) return;

        const rect = container.getBoundingClientRect();
        let newX = (clientX - rect.left) / rect.width;
        let newY = (clientY - rect.top) / rect.height;

        // Clamp values between 0 and 1
        newX = Math.max(0, Math.min(1, newX));
        newY = Math.max(0, Math.min(1, newY));

        value = { x: newX, y: newY };
        dispatch('change', value);
    }

    function handleMouseDown(e) {
        isDragging = true;
        updatePosition(e.clientX, e.clientY);
    }

    function handleTouchStart(e) {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    }

    function handleMove(e) {
        if (e.type === 'touchmove') {
            e.preventDefault();
            updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        } else {
            updatePosition(e.clientX, e.clientY);
        }
    }

    function stopDragging() {
        isDragging = false;
    }
</script>

<svelte:window
    on:mousemove={handleMove}
    on:mouseup={stopDragging}
    on:touchmove={handleMove}
    on:touchend={stopDragging}
/>

<div class="wrapper">
    <div
        class="container"
        style="
      width: {width}px;
      height: {height}px;
      background-size: {width / gridCellsX}px {height / gridCellsY}px
    "
        on:mousedown={handleMouseDown}
        on:touchstart={handleTouchStart}
        bind:this={container}
    >
        <div
            class="point"
            style="left: {value.x * 100}%; top: {value.y * 100}%"
        />
        <div class="axis-label x-min">0.0</div>
        <div class="axis-label x-max">1.0</div>
        <div class="axis-label y-min">1.0</div>
        <div class="axis-label y-max">0.0</div>
    </div>
</div>

<style>
    .wrapper {
        display: inline-block;
    }

    .container {
        border: 2px solid #333;
        position: relative;
        user-select: none;
        touch-action: none;
        background-color: white;
        background-image:
                linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
    }

    .container::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: rgba(0,0,0,0.2);
        transform: translateX(-50%);
    }

    .container::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: rgba(0,0,0,0.2);
        transform: translateY(-50%);
    }

    .point {
        width: 20px;
        height: 20px;
        background: #ff3e00;
        border: 2px solid white;
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        cursor: grab;
        box-shadow: 0 0 3px rgba(0,0,0,0.3);
        z-index: 1;
    }

    .point:active {
        cursor: grabbing;
    }

    .axis-label {
        position: absolute;
        font-family: sans-serif;
        font-size: 12px;
        color: #666;
    }

    .x-min { left: 5px; bottom: 5px; }
    .x-max { right: 5px; bottom: 5px; }
    .y-min { left: 5px; bottom: 5px; }
    .y-max { left: 5px; top: 5px; }
</style>