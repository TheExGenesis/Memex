import type Dexie from 'dexie'
import type { PersonalCloudClientInstruction } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import { PersonalCloudActionType } from './types'

type QueueActionData =
    | {
          type: PersonalCloudActionType.PushObject
          collection: string
          objs: any[]
      }
    | {
          type: PersonalCloudActionType.ExecuteClientInstructions
          clientInstructions: PersonalCloudClientInstruction[]
      }

interface Dependencies {
    db: Dexie
    queueObjs: (actionData: QueueActionData) => Promise<void>
}

async function findAllObjectsChunked<T = any>(args: {
    db: Dexie
    collection: string
    chunkSize: number
    cb: (objs: T[]) => Promise<void>
}) {
    let skip = 0
    let objs: T[]

    do {
        objs = await args.db
            .table(args.collection)
            .offset(skip)
            .limit(args.chunkSize)
            .toArray()
        skip += args.chunkSize
        await args.cb(objs)
    } while (objs.length === args.chunkSize)
}

// NOTE: the order of steps in this function matters a lot!
const _prepareDataMigration = ({
    db,
    queueObjs,
}: Dependencies) => async (): Promise<void> => {
    const queueAllObjects = async (
        collection: string,
        args?: { chunked: boolean },
    ) => {
        if (args?.chunked) {
            await findAllObjectsChunked({
                db,
                chunkSize: 500,
                collection: collection,
                cb: async (objs) =>
                    queueObjs({
                        type: PersonalCloudActionType.PushObject,
                        collection,
                        objs,
                    }),
            })
        } else {
            const objs = await db.table(collection).toArray()
            await queueObjs({
                type: PersonalCloudActionType.PushObject,
                collection,
                objs,
            })
        }
    }

    // Step 1.1: pages
    await queueAllObjects('pages', { chunked: true })

    // Step 1.2: visits
    await queueAllObjects('visits', { chunked: true })

    // Step 1.3: bookmarks
    await queueAllObjects('bookmarks')

    // Step 2.1: annotations
    await queueAllObjects('annotations')

    // Step 2.2: annotation privacy levels
    await queueAllObjects('annotationPrivacyLevels')

    // Step 2.3: annotation share metadata
    await queueAllObjects('sharedAnnotationMetadata')

    // Step 3.1: lists
    await queueAllObjects('customLists')

    // Step 3.2: list entries
    await queueAllObjects('pageListEntries')

    // Step 3.3: list share metadata
    await queueAllObjects('sharedListMetadata')

    // Step 4.1: tags
    await queueAllObjects('tags')

    // Step 4.2: settings
    await queueAllObjects('settings')

    // Step 4.3: copy-paster templates
    await queueAllObjects('templates')

    // Step 5.1: fav-icons
    // await queueAllObjects('templates')
    // await queueObjs({ type: PersonalCloudActionType.ExecuteClientInstructions, clientInstructions: [] })
}

export const prepareDataMigration = (deps: Dependencies) =>
    deps.db.transaction(
        'rw!',
        [
            'pages',
            'visits',
            'bookmarks',
            'annotations',
            'annotationPrivacyLevels',
            'sharedAnnotationMetadata',
            'customLists',
            'pageListEntries',
            'sharedListMetadata',
            'tags',
            'settings',
            'templates',
            'favIcons',
            'personalCloudAction',
        ],
        _prepareDataMigration(deps),
    )
