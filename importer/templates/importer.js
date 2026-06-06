function expandFolder(arrow) {
    // toggle rotate the current arrow
    arrow.classList.toggle('fa-rotate-90');

    // get the accordion element for the clicked arrow
    const accordion = arrow.closest('label');
    console.log('accordion', accordion)

    // get the accordion-panel element for the clicked accordion
    const accordion_panel = accordion.nextElementSibling;
    console.log('accordion_panel', accordion_panel)

    // if max height is set on current accordion panel
    if (accordion_panel.style.maxHeight) {
        resetNestedPanelHeight(accordion_panel)
    } else { // if max height is not set
        increaseNestedPanelHeight(accordion_panel);
    }
}

function increaseNestedPanelHeight(accordion_panel) {
    console.log('increaseNestedPanelHeight', accordion_panel)
    
    // add the current panel height to the max height of all the parent accordion-panel elements
    accordion_panel.style.maxHeight = accordion_panel.scrollHeight + "px";

    // get the parent id for the clicked accordion
    const parentId = accordion_panel.getAttribute('parentId');

    // get the accordion whose id matches the parent id
    const parentAccordion = document.getElementById(parentId);

    // update the parent accordion panel height
    if (parentAccordion && parentAccordion.style.maxHeight) {
        parentAccordion.style.maxHeight = parentAccordion.scrollHeight + accordion_panel.scrollHeight + "px";
        increaseNestedPanelHeight(parentAccordion);
    }
}

function resetNestedPanelHeight(accordion_panel){
    console.log('resetNestedPanelHeight', accordion_panel)

    // reset the height of the current accordion panel
    accordion_panel.style.maxHeight = null;
    accordion_panel.querySelector('.arrow i')?.classList.remove('fa-rotate-90');

    // get the parent id for the clicked accordion
    const panelId = accordion_panel.getAttribute('id');

    // get the accordions whose parentId matches this id
    const childAccordions = document.querySelectorAll(`.accordion-panel[parentId='${panelId}']`);

    // reset the height of all the child accordions
    childAccordions.forEach(
        childAccordion => {
            resetNestedPanelHeight(childAccordion);
        }
    );
}

const arrows = document.querySelectorAll(".arrow i");
arrows.forEach(arrow => {
    arrow.addEventListener("click", (event) => {
        event.preventDefault();
        expandFolder(arrow)
    });
});

function fuzzyMatch(needle, haystack) {
    let hlen = haystack.length;
    let nlen = needle.length;
    if (nlen > hlen) {
        return false;
    }
    if (nlen === hlen) {
        return needle === haystack;
    }
    outer: for (let i = 0, j = 0; i < nlen; i++) {
        const nch = needle.charCodeAt(i);
        while (j < hlen) {
            if (haystack.charCodeAt(j++) === nch) {
                continue outer;
            }
        }
        return false;
    }
    return true;
}

function resetPanel() {
    // reset the file explorer to its base config
    const depth0 = panelBlock.querySelectorAll('label.panel-block[folder-id=""]');
    const everythingElse = panelBlock.querySelectorAll('label.panel-block:not([folder-id=""])');

    depth0.forEach(label => {
        label.style.display = '';
    });

    everythingElse.forEach(label => {
        label.style.display = 'none';
    });

    // Select the arrow element
    const arrows = document.querySelectorAll(`.arrow i`);

    // Toggle the rotation class on the arrow element
    arrows.forEach(arrow => {
        arrow.classList.remove('fa-rotate-90');
    });
}

// Get the search input and panel elements
const searchInput = document.getElementById('search-input');
const panelBlock = document.querySelector('.panel-block-container');

// Add an input event listener to the search input
searchInput.addEventListener('input', () => {
    // Get the search query
    let query = searchInput.value.toLowerCase();

    if (query) {
        // Loop through each label in the panel
        panelBlock.querySelectorAll('label').forEach(label => {
            // Get the label text
            const labelText = label.textContent.toLowerCase().trim();

            // Show or hide the label based on whether the query matches the label text
            if (fuzzyMatch(query, labelText)) {
                label.style.display = '';
            } else {
                label.style.display = 'none';
            }
        });
    } else {
        resetPanel()
    }
});



// add action to make the select all checkbox select/deselect all top level objects
const selectAllCheckbox = document.getElementById("select-all-checkbox");
const checkboxes = document.querySelectorAll('.panel-block-container label[folder-id=""] input[type="checkbox"]');
selectAllCheckbox.addEventListener("change", function () {
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = selectAllCheckbox.checked;
    });
});

const clearSearchButton = document.querySelector('.clear-search');
clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    resetPanel()
});
