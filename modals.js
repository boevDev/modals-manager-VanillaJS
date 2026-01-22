/**
 * Менеджер модальных окон.
 * Поддержка стека, хуков, динамических модалок, Promise, анимаций.
 *
 * @param {Object} options
 * @param {string} [options.modalSelector=".modal"]
 * @param {string} [options.openClass="modal--open"]
 * @param {string} [options.openerSelector="[data-modal-target]"]
 * @param {string} [options.closerSelector="[data-modal-close]"]
 * @param {string} [options.backdropSelector=".modal--fade"]
 * @param {boolean} [options.closeOnEsc=true]
 * @param {boolean} [options.closeOnBackdrop=true]
 * @param {number} [options.transitionDuration=300]
 * @param {Object.<string, Function>} [options.hooks={}] - beforeOpen, open, beforeClose, close
 *
 * @returns {Object} API менеджера
 */
export function createModalManager(options = {}) {
    const {
        modalSelector = ".modal",
        openClass = "modal--open",
        openerSelector = "[data-modal-target]",
        closerSelector = "[data-modal-close]",
        backdropSelector = ".modal--fade",
        closeOnEsc = true,
        closeOnBackdrop = true,
        transitionDuration = 300,
        hooks = {},
    } = options;

    const modalsMap = new Map();
    const modalStack = [];
    let observer = null;

    /* --------------------- Utils --------------------- */
    const collectModals = () => {
        modalsMap.clear();
        document.querySelectorAll(modalSelector).forEach((modal) => {
            if (!modal.id) {
                console.warn("Модалка без id:", modal);
                return;
            }
            modalsMap.set(modal.id, modal);
        });
    };

    const getModal = (id) => {
        const modal = modalsMap.get(id);
        if (!modal) console.warn(`Модалка с id "${id}" не найдена`);
        return modal || null;
    };

    const callHook = async (type, id, modal, data) => {
        try {
            if (typeof hooks[type] === "function") await hooks[type](modal, id, data);
            const localHook = modal?.dataset[type];
            if (localHook && typeof window[localHook] === "function") {
                await window[localHook](modal, id, data);
            }
        } catch (e) {
            console.error(`Ошибка в хуке "${type}" модалки "${id}":`, e);
        }
    };

    const waitTransition = (modal) =>
        new Promise((resolve) => {
            const handler = () => {
                modal.removeEventListener("transitionend", handler);
                resolve();
            };
            modal.addEventListener("transitionend", handler);
            setTimeout(resolve, transitionDuration + 50);
        });

    const updateBodyScroll = () => {
        if (modalStack.length > 0) document.body.classList.add("modal-open");
        else document.body.classList.remove("modal-open");
    };

    /* --------------------- Core --------------------- */
    const open = async (id, data) => {
        const modal = getModal(id);
        if (!modal) return Promise.reject();

        if (modalStack.includes(id)) return Promise.resolve();

        await callHook("beforeOpen", id, modal, data);

        if (modalStack.length > 0) {
            const topId = modalStack[modalStack.length - 1];
            const topModal = getModal(topId);
            if (topModal) topModal.classList.remove(openClass);
        }

        modal.classList.add(openClass);
        modalStack.push(id);

        updateBodyScroll();

        await waitTransition(modal);
        await callHook("open", id, modal, data);

        return Promise.resolve();
    };

    const close = async (id, data) => {
        const modal = getModal(id);
        if (!modal || !modalStack.includes(id)) return Promise.resolve();

        await callHook("beforeClose", id, modal, data);

        modal.classList.remove(openClass);
        modalStack.splice(modalStack.indexOf(id), 1);

        if (modalStack.length > 0) {
            const topId = modalStack[modalStack.length - 1];
            const topModal = getModal(topId);
            if (topModal) topModal.classList.add(openClass);
        }

        updateBodyScroll();

        await waitTransition(modal);
        await callHook("close", id, modal, data);

        return Promise.resolve();
    };

    const closeAll = () => Promise.all(modalStack.map((id) => close(id)));
    const getActive = () => (modalStack.length ? modalStack[modalStack.length - 1] : null);
    const isOpen = (id) => modalStack.includes(id);

    /* --------------------- Events --------------------- */
    const handleClick = (e) => {
        const opener = e.target.closest(openerSelector);
        if (opener) {
            const id = opener.dataset.modalTarget?.trim();
            if (!id) return;
            open(id);
            return;
        }

        const closer = e.target.closest(closerSelector);
        if (closer) {
            const modal = closer.closest(modalSelector);
            if (modal?.id) close(modal.id);
            return;
        }

        if (!closeOnBackdrop) return;
        const backdrop = e.target.closest(backdropSelector);
        if (backdrop && e.target === backdrop) {
            const modal = backdrop.closest(modalSelector);
            if (modal?.id) close(modal.id);
        }
    };

    const handleKeydown = (e) => {
        if (!closeOnEsc) return;
        if (e.key !== "Escape") return;
        const activeId = getActive();
        if (activeId) close(activeId);
    };

    /* --------------------- Lifecycle --------------------- */
    const init = () => {
        collectModals();
        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleKeydown);

        observer = new MutationObserver(collectModals);
        observer.observe(document.body, { childList: true, subtree: true });
    };

    const destroy = () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("keydown", handleKeydown);
        observer?.disconnect();
        modalStack.length = 0;
        modalsMap.clear();
        document.body.classList.remove("modal-open");
    };

    init();

    return {
        open,
        close,
        closeAll,
        isOpen,
        getActive,
        refresh: collectModals,
        destroy,
    };
}
