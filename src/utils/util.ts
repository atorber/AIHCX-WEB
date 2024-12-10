
import { getFilesOrDirs } from '../api/aiak'

export const getDirs = async (rootPath?: string) => {
  rootPath = rootPath || '/'
    const res: {
      data: {
        list: {
          name: string;
          type: string;
        }[]
      }
    } = await getFilesOrDirs({ path: rootPath })
    console.log('res', res)
    const { list } = res.data
    const nodes = list.filter((item)=>{
      return item.type !== 'file'
    }).map((item) => ({
      value: item.name,
      label: item.name,
      leaf: item.type === 'file',
    }))
    return nodes
  }

  export const getFiles = async (rootPath?: string) => {
    rootPath = rootPath || '/'
      const res: {
        data: {
          list: {
            name: string;
            type: string;
          }[]
        }
      } = await getFilesOrDirs({ path: rootPath })
      console.log('res', res)
      const { list } = res.data
      const nodes = list.map((item) => ({
        value: item.name,
        label: item.name,
        leaf: item.type === 'file',
      }))
      return nodes
    }