<script>
    import { createEventDispatcher, onMount } from 'svelte';
    const dispatch = createEventDispatcher();

    export let x = 1;
    export let y = 1;
    export let min = -1;
    export let max = 1;
    export let step = 0.01;
    export let width_locale = "width";
    export let height_locale = "height";

    let container;
    let displayValueX;
    let displayValueY;
    let isDragging = false;

    function applyStep(value) {
        return Math.round(value / step) * step;
    }

    function actualToNormalized(actual) {
        return (actual - min) / (max - min);
    }

    function normalizedToActual(normalized) {
        return min + (normalized * (max - min));
    }

    function updatePosition({ clientX, clientY }) {
        if (!isDragging) return;
        const rect = container.getBoundingClientRect();

        let normalizedX = (clientX - rect.left) / rect.width;
        let normalizedY = (clientY - rect.top) / rect.height;
        normalizedX = Math.max(0, Math.min(1, normalizedX));
        normalizedY = Math.max(0, Math.min(1, 1 - normalizedY));

        let actualX = applyStep(normalizedToActual(normalizedX));
        let actualY = applyStep(normalizedToActual(normalizedY));
        actualX = Math.max(min, Math.min(max, actualX));
        actualY = Math.max(min, Math.min(max, actualY));

        normalizedX = actualToNormalized(actualX);
        normalizedY = actualToNormalized(actualY);

        const value = { x: actualX, y: actualY, displayX: normalizedX, displayY: normalizedY };
        x = value.x;
        y = value.y;
        displayValueX = value.displayX;
        displayValueY = value.displayY;
        dispatch('change', value);

        console.log(value);
    }

    function handleMouseDown(e) {
        isDragging = true;
        updatePosition({ clientX: e.clientX, clientY: e.clientY });
    }

    function handleTouchStart(e) {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        updatePosition({ clientX: touch.clientX, clientY: touch.clientY });
    }

    function handleMove(e) {
        if (e.type === 'touchmove') {
            e.preventDefault();
            updatePosition({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        } else {
            updatePosition({ clientX: e.clientX, clientY: e.clientY });
        }
    }

    function stopDragging() {
        isDragging = false;
    }

    onMount(() => {
        displayValueX = actualToNormalized(x);
        displayValueY = actualToNormalized(y);
    });
</script>

<svelte:window
    on:mousemove={handleMove}
    on:mouseup={stopDragging}
    on:touchmove={handleMove}
    on:touchend={stopDragging}
/>

<div class="wrapper w-[95%] rounded-lg" style="--value-x: {displayValueX}; --value-y: {displayValueY};">
    <div
        role="none"
        class="container w-full h-[150px] rounded-lg"
        on:mousedown={handleMouseDown}
        on:touchstart={handleTouchStart}
        bind:this={container}
    >
        <div
            class="point"
            style="left: {displayValueX * 100}%; top: {(1 - displayValueY) * 100}%"
        />
        <p class="x-axis-label">{width_locale}</p>
        <p class="y-axis-label">{height_locale}</p>
    </div>
    <div class="w-full flex items-center justify-center gap-4 mt-4">
        <div class="progress-x rounded-lg w-1/2 h-1.5"></div>
        <div class="progress-y rounded-lg w-1/2 h-1.5"></div>
    </div>
</div>

<style>
    .container {
        border: 2px solid rgb(60 60 60 / 0.5);
        position: relative;
        user-select: none;
        touch-action: none;
        background: rgb(37 37 37 / 0.5) url('../../assets/arrows_background.png');
        background-size: 100% 100%;
    }

    .point {
        width: 20px;
        height: 20px;
        background: white;
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

    .x-axis-label {
        position: absolute;
        font-size: 12px;
        right: 10px;
        bottom: 50%;
    }

    .y-axis-label {
        position: absolute;
        font-size: 12px;
        top: 3px;
        right: 0;
        width: 49%;
        text-align: start;
    }

    .progress-x {
        background: linear-gradient(to right,
        var(--accent) calc(var(--value-x) * 100%),
        rgb(37 37 37 / 0.5) calc(var(--value-x) * 100%));
    }

    .progress-y {
        background: linear-gradient(to right,
        var(--accent) calc(var(--value-y) * 100%),
        rgb(37 37 37 / 0.5) calc(var(--value-y) * 100%));
    }
</style>