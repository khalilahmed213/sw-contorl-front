// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { VDateInput } from 'vuetify/labs/VDateInput'
// Vuetify
import { createVuetify } from 'vuetify'
import fr from 'vuetify/lib/locale/fr';

export default createVuetify(
{
  locale: {
    locale: 'fr',
    fallback: 'fr',
    messages: {fr},
  },
  components: {
    VDateInput,
  },
}
)
