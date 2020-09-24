# nightscout-alexa-skill

This is custom alexa skill, v2 sdk

Go to Alexa Developer Console, create new custom skill, Alexa hosted (Node.js).
When asked for template import the skill form this Github repository.

Then edit code in index.js, since you need to insert your url of nightscout and you have to add secret passphrase.
Passphrase is written in encrypted format, you can see it in your browser console when authenticating.

# usage examples (see intents for more ideas)
> alexa ask nightscout what is my sugar
> alexa ask night scout to register set change
> alexa ask night scout to register sensor change
> alexa ask night scout to register battery change
> alexa ask night scout to register new insulin
